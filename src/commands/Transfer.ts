import { CommandInteraction, Client, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../Command";
import { getJoyData, sendJoyToken } from '../database/control';
import { isNumberObject } from "util/types";

export const Transfer: Command = {

    name: "send",
    description: "send JOY to other discord user",
    options: [
        {
            name: "receiver",
            description: 'discord ID of receiver',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "amount",
            description: 'amount of JOY to send',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {

        const { user, options } = interaction;

        const variableAmount = await getJoyData(user.tag);
        let content;

        const amount = Number(options.get("amount")?.value);
        if (isNaN(amount)) {
            content = "Amount value invalid!";
        }
        else if (variableAmount.collageAmount < amount)
            content = "Amount value exceeds deposit!";
        else {
            const receiver = String(options.get("receiver")?.value);
            const sendValue = await sendJoyToken(user.tag, receiver, amount);
            content = `${sendValue}`;
        }
        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};