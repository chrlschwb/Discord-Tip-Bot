import {
  CommandInteraction,
  Client,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import { getJoyData, setJoyData, updateJoyData } from "../database/control";
import { useGetTransfers } from "../query/generator/extrinsics";
import { createHash } from "crypto";

function generateKeyFromSeed(seedWord: string): string {
  const hash = createHash("sha256");
  hash.update(seedWord);
  const digest = hash.digest("hex");
  return digest;
}

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

    let content: string = "";

    const wallet = String(options.get("wallet")?.value);
    const mnemonic = String(options.get("seed")?.value);

    const key = generateKeyFromSeed(mnemonic);

    const claimState = await setJoyData(user.tag, wallet, key);
    if (claimState) {
      content = "Your wallet is already verify";
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
      if (extrinsics.length !== 0) {
        const amount = extrinsics.reduce(
          (a: number, b) => (a += Number(b.value)),
          0
        );
        const updateData = await updateJoyData(
          user.tag,
          amount / 10000000000,
          wallet
        );
        content = updateData;
      } else {
        content = "You have don't amount";
      }
    } else {
      content = key;
    }
    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
