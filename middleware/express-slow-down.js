import slowDown from "express-slow-down"

const slow = slowDown({
    windowMs: 5 * 60 * 1000,
    delayAfter: 5,
    delayMs:(hit)=>hit*10*1000
})  
export {
    slow 
}