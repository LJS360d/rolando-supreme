import { ButtonInteraction } from "discord.js";
import { InteractionManager } from "../rolando/discord/InteractionManager";

type ButtonPressInteraction = {
  customId: string;
  fn: (interaction: ButtonInteraction) => void;
};

export const buttonInteractions: ButtonPressInteraction[] = [
  {
    customId: 'overwrite-training',
    fn: InteractionManager.getTrainingData,
  },
  {
    customId: 'confirm-provide-training',
    fn: InteractionManager.confirmProvideTraining,
  },
  {
    customId: 'cancel-provide-training',
    fn: InteractionManager.cancelProvideTraining,
  },
  {
    customId: 'confirm-reset-training',
    fn: InteractionManager.confirmResetTraining,
  },
  {
    customId: 'cancel-reset-training',
    fn: InteractionManager.cancelResetTraining,
  },   
]