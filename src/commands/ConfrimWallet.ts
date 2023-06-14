import {
  CommandInteraction,
  Client,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import {
  Challenge,
  getChallengeData,
  getJoyData,
  updateJoyData,
} from "../database/control";
import { ClaimVerify, transferChallenge } from "../utils/signAndVerify";
import { useGetTransfers } from "../query/generator/extrinsics";

export const ConfirmWallet: Command = {
  name: "confirm",
  description: "challenge charactors confirm",
  options: [
    {
      name: "challenge",
      description:
        "Signed challenge must be exactly 130 symbols. You sent a string with symbols",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client: Client, interaction: CommandInteraction) => {
    const { user, options } = interaction;

    const decChallenge: string = String(options.get("challenge")?.value);
    let content: string = "";

    const claimm = await getChallengeData(user.tag);

    if (!claimm) {
      content = "Your confirm is faild";
    } else {
      const { challenge, name, wallet } = claimm as Challenge;

      if (challenge && wallet) {
        const verify: ClaimVerify = {
          challenge: challenge,
          decodeChallenge: decChallenge,
          wallet: wallet,
        };
        const confirm = await transferChallenge(verify);

        if (confirm) {
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
            content = "You have error";
          }
        } else {
          content = "Your verify key is faild";
        }
      }
    }

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
