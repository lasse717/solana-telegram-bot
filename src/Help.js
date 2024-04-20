require('dotenv').config();

const storage = require('node-persist');

storage.init();

/**
 * Sends a help message to the user with information about the BONKbot.
 *
 * @param {number} chatId - The chat ID of the user to send the message to.
 * @param {object} bot - The Telegram bot instance to use for sending the message.
 */
function help(chatId, bot) {
    const HELP_TEXT =
        "<b>Help:</b>\n\n" +
        "<b>Which tokens can I trade?</b>\n" +
        "Any SPL token that is a Sol pair, on Raydium, Orca, and Jupiter." +
        " We pick up raydium pairs instantly, and Jupiter will pick up non sol pairs within around 15 minutes\n\n" +
        "<b>How can I see how much money I've made from referrals?</b>\n" +
        "Check the referrals button or type /referrals to see your payment in Bonk!\n\n" +
        "<b>I want to create a new wallet on BONKbot.</b>\n" +
        "Click the Wallet button or type /wallet," +
        " and you will be able to configure your new wallets\n\n" +
        "<b>Is BONKbot free? How much do i pay for transactions?</b>\n" +
        "BONKbot is completely free! We charge 1% on transactions," +
        " and keep the bot free so that anyone can use it.\n\n" +
        "<b>Why is My Net Profit Lower Than Expected?</b>\n" +
        "Your Net Profit is calculated after deducting all associated costs," +
        " including Price Impact, Transfer Tax, Dex Fees, and a 1% BONKbot fee." +
        " This ensures the figure you see is what you actually receive," +
        " accounting for all transaction-related expenses.\n\n" +
        "<b>Is there a difference between @bonkbot_bot and the backup bots?</b>\n" +
        "No, they are all the same bot and you can use them interchangeably." +
        " If one is slow or down, you can use the other ones. You will have access to the same wallet and positions.\n\n" +
        "Further questions? Join our Telegram group:\n" +
        "https://t.me/BONKbotChat";

    bot.sendMessage(chatId, HELP_TEXT, {
        reply_markup: {
            inline_keyboard: [[{ text: "Close", callback_data: "close" }]],
        },
        parse_mode: "html",
    });
}

module.exports = {
    help
}