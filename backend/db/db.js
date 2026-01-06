import mongoose from "mongoose";

 const DbCon=async()=>{
    try {
        console.log("mongo_uri: ", process.env.MONGO_URL);
        const conn= await mongoose.connect(process.env.MONGO_URL)
        console.log('Mongodb is connected')
    } catch (error) {
        console.log('mongosdb connection error',error)
        process.exit(1);
    }
}
export default DbCon;