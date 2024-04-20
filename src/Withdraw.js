require('dotenv').config();

const web3 = require('@solana/web3.js');
const storage = require('node-persist');
const base58 = require('bs58');
const connection = new web3.Connection(process.env.RPC_URL);

storage.init();

const Withdraw = async (chatId, bot, amountType) => {
    let user_pub_key;
    let user_pri_key;
    let user_secret_key;
    /**
     * Retrieves the user's wallet information from storage and assigns it to the corresponding variables.
     *
     * @param {string} chatId - The unique identifier for the user's chat session.
     * @returns {Promise<void>} - A Promise that resolves when the wallet information has been retrieved and assigned.
     */
    await storage.getItem(`userWallet_${chatId}`).then(async (userWallet) => {
        user_pub_key = userWallet.publicKey;
        user_pri_key = userWallet.privateKey;
        user_secret_key = web3.Keypair.fromSecretKey(base58.decode(user_pri_key));
    });

    const balance = await connection.getBalance(new web3.PublicKey(user_pub_key));
    const walletbalance = balance / web3.LAMPORTS_PER_SOL;

    if (amountType === "x") {
        bot.sendMessage(chatId, `Reply with the amount to withdraw(0 - ${walletbalance})`, {
            reply_markup: { force_reply: true }
        }).then(msg => {
            bot.onReplyToMessage(chatId, msg.message_id, async (msg) => {
                const amount = parseFloat(msg.text);
                if (isNaN(amount) || amount < 0 || amount > walletbalance) {
                    bot.sendMessage(chatId, "Invalid withdrawal amount. Please enter a valid amount.");
                } else {
                    bot.sendMessage(chatId, 'Reply with the destination address', {
                        reply_markup: { force_reply: true }
                    }).then(async (msg) => {
                        bot.onReplyToMessage(chatId, msg.message_id, async (msg_address) => {
                            const destinationAddress = msg_address.text.trim();
                            // Validate the destination address
                            try {
                                if (web3.PublicKey.isOnCurve(new web3.PublicKey(destinationAddress))) {
                                    // Withdraw the specified amount to the destination address
                                    const transaction = new web3.Transaction().add(
                                        web3.SystemProgram.transfer({
                                            fromPubkey: new web3.PublicKey(user_pub_key),
                                            toPubkey: new web3.PublicKey(destinationAddress),
                                            lamports: web3.LAMPORTS_PER_SOL * amount
                                        })
                                    );

                                    bot.sendMessage(chatId, 'Withdrawing SOL...');

                                    try {
                                        const signature = await web3.sendAndConfirmTransaction(connection, transaction, [user_secret_key]);
                                        const sig_text = `Transaction confirmed, Transaction ID:\n <a href="https://solscan.io/tx/${signature}">${signature}</a>`;
                                        bot.sendMessage(chatId, sig_text, { parse_mode: 'HTML' });
                                    } catch (error) {
                                        bot.sendMessage(chatId, `Error withdrawing SOL: ${error.message}`);
                                    }
                                }
                            } catch (error) {
                                bot.sendMessage(chatId, `Invalid destination address:\n ${error.message}`);
                            }
                        })
                    });
                }
            });
        })
    } else if (amountType === "all") {
        bot.sendMessage(chatId, 'Reply with the destination address', {
            reply_markup: { force_reply: true }
        }).then(msg => {
            bot.onReplyToMessage(chatId, msg.message_id, async (msg_address) => {
                const destinationAddress = msg_address.text.trim();
                // Validate the destination address
                try {
                    if (web3.PublicKey.isOnCurve(new web3.PublicKey(destinationAddress))) {
                        const sender = new web3.PublicKey(user_pub_key);
                        const receiver = new web3.PublicKey(destinationAddress);
                        const rentExemptLamports = await connection.getMinimumBalanceForRentExemption(1);
                        const amountToSend = balance - rentExemptLamports;

                        const transaction = new web3.Transaction().add(
                            web3.SystemProgram.transfer({
                                fromPubkey: sender,
                                toPubkey: receiver,
                                lamports: amountToSend
                            })
                        );

                        bot.sendMessage(chatId, 'Withdrawing SOL...');

                        try {
                            const signature = await web3.sendAndConfirmTransaction(connection, transaction, [user_secret_key]);
                            const sig_text = `Transaction confirmed, Transaction ID:\n <a href="https://solscan.io/tx/${signature}">${signature}</a>`;
                            bot.sendMessage(chatId, sig_text, { parse_mode: 'HTML' });
                        } catch (error) {
                            bot.sendMessage(chatId, `Transaction failed, withdrawing SOL: ${error.message}`);
                        }
                    }
                } catch (error) {
                    bot.sendMessage(chatId, `Invalid destination address:\n ${error.message}`);
                }
            })
        });
    }


}

module.exports = {
    Withdraw
}