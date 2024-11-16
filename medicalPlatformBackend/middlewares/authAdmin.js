import jwt from "jsonwebtoken";

//admin authentification middelware
const authAdmin = async (req,res,next) =>{
    try{
        const {atoken} = req.headers
        if(!atoken){
            return res.json({succes:false, message:'Not Authorized Login Again 1'})
        }
        const {role,email} = jwt.verify(atoken, process.env.JWT_SECRET)

        // Imprimer le contenu du token décodé
        console.log("Decoded token role:", role);
        console.log("Type of role:", typeof role);
        console.log("email + password", process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD)

        if(email !== process.env.ADMIN_EMAIL || role !== 'admin'){
            return res.json({succes:false, message: 'Not Authorized Login Again 73847983467'})
        }
        next()

    }catch(error){
        console.log(error)
        res.json({succes:false, message:error.message})
    }
}
export default authAdmin