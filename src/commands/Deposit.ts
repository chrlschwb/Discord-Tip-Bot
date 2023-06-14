import {
  CommandInteraction,
  Client,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import { getJoyData, updateJoyData } from "../database/control";
import { transferBalance } from "../transaction/transferJoy";
import { decodeAddress, encodeAddress } from "../hook/formatAddress";
import {
  asExtrinsic,
  getExtrinsics,
  useGetTransfers,
} from "../query/generator/extrinsics";

export const Deposit: Command = {
  name: "deposit",
  description: "deposit JOY tokens",
  options: [
    {
      name: "seed",
      description: "Secret seed",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "wallet",
      description: "The wallet address of JOY tokens to deposit",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client: Client, interaction: CommandInteraction) => {
    const { options, user } = interaction;

    let content: string = "test";

    const wallet = String(options.get("wallet")?.value);

    if (wallet) {
      const dbdata = await getJoyData(user.tag);
      const date = new Date(dbdata.day);
      const filter = {
        call: {
          name_eq: "Balances.transfer",
          block: {
            timestamp_gt: date,
          },
        },
      };
      const extrinsics = await useGetTransfers(filter, wallet);
      const amount = extrinsics.reduce(
        (a: number, b) => (a += Number(b.value)),
        0
      );
      const updateData = await updateJoyData(user.tag, amount / 10000000000);
      content = updateData;
      console.log(extrinsics, amount / 10000000000);
    }
    // if (isNaN(amount)) {
    //     content = "Amount value invalid!";
    // }
    // else {
    //     const seed = String(options.get("seed")?.value);
    //     const recipient = process.env.SERVER_WALLET_ADDRESS;
    //     const transfer = await transferBalance(seed, recipient!, amount * 10000000000)
    //     if (transfer) {
    //         content = `${updateData}!`;
    //     } else {
    //         content = 'Error : Deposit error'
    //     }
    // }

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
