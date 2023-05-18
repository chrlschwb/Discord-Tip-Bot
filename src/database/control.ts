import JoyModel from "./models";

export const getJoyData = async (username: string) => {
    const JoyData =
        (await JoyModel.findOne({ userName: username })) ||
        (await JoyModel.create({
            userName: username,
            walletAddress: 0,
            amount: 0,
            day: Date.now(),
            collageAmount: 0,
        }));

    return JoyData;
};

export const updateJoyData = async (userName: string, amount: number) => {
    const joyData = await JoyModel.findOne({ userName: userName });
    if (!joyData) return "You are not registered. Please register now.";

    joyData.amount = amount;
    joyData.day = Date.now();
    joyData.collageAmount ? joyData.collageAmount += amount : joyData.collageAmount = amount;

    joyData.save();
    return `Your deposit is ${amount} JOY`;

};

export const setJoyData = async (userName: string, address: string) => {
    const JoyData =
        (await JoyModel.findOne({ userName: userName })) ||
        (await JoyModel.create({
            userName: userName,
            walletAddress: address,
            amount: 0,
            day: Date.now(),
            collageAmount: 0,
        }));
    JoyData.walletAddress = address;
    return JoyData.save();
};

export const sendJoyToken = async (userName: string, receiver: string, amount: number) => {
    let error: string;

    const tx = await JoyModel.findOne({ userName: userName });
    if (!tx) return error = "Error : sender's username is unregistered";

    const rx = await JoyModel.findOne({ userName: receiver });
    if (!rx) return error = "Error : receiver's username is unregistered";

    tx.amount = amount;
    tx.day = Date.now();
    tx.collageAmount -= amount;

    tx.save();

    rx.amount = amount;
    rx.day = Date.now();
    rx.collageAmount += amount

    rx.save();

    return `You have sent ${receiver} ${amount} JOY`;
};

export const withdrawJoy = async (userName: string, amount: number) => {
    const joyData = await JoyModel.findOne({ userName: userName });

    if (!joyData) return "You are not registered. Please register now.";

    joyData.amount = -amount;
    joyData.day = Date.now();
    joyData.collageAmount -= amount;

    joyData.save();

    return `You have withdrawn ${amount} JOY`;

};
