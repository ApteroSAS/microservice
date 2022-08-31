import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface BalancerDTO{
    roomSID:string,
    clones:{[id:string]: { url:string }},
}

const BalancerSchema = new Schema({
    roomSID:{
        type: String,
        required: true,
        unique : true
    },
    clones:{
        type: Object
    },
});

export const balancerDB = mongoose.model("Balancer", BalancerSchema);
export const BalancerDB = balancerDB;