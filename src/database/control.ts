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
    return JoyData;
};

export const sendJoyToken = async (userName: string, reiceve: string, amount: number) => {
    let error: string;

    const sendJoy = await JoyModel.findOne({ userName: userName });
    if (!sendJoy) return error = "Error : sender's username is unregistered";

    const recieveJoy = await JoyModel.findOne({ userName: reiceve });
    if (!recieveJoy) return error = "Error : receiver's username is unregistered";

    sendJoy.amount = amount;
    sendJoy.day = Date.now();
    sendJoy.collageAmount -= amount;

    sendJoy.save();


    recieveJoy.amount = amount;
    recieveJoy.day = Date.now();
    recieveJoy.collageAmount += amount

    recieveJoy.save();

    return `You send to ${reiceve} ${amount} Joy`;
};

export const withdrawJoy = async (userName: string, amount: number) => {
    const joyData = await JoyModel.findOne({ userName: userName });

    if (!joyData) return "You are not unregister. Please register now.";

    joyData.amount = -amount;
    joyData.day = Date.now();
    joyData.collageAmount -= amount;

    joyData.save();

    return `You are withdraw ${amount}Joy`;

};
