import AsyncStorage from "@react-native-async-storage/async-storage"

export const storeLocalData = async (key: string, value: string) =>{
    try {
        await AsyncStorage.setItem(key,value)
    } catch (error) {
        console.log("storage Data Error: ", error)
    }
}

export const getLocalData = async (key: string)=>{
    try {
        const value = await AsyncStorage.getItem(key)
        return value
    } catch (error) {
        console.log("storage get Data Error: ", error)
    }
}