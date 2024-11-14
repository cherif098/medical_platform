// controllers/adminController.js
import { insertDoctor } from '../models/doctorModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { executeQuery } from '../config/snowflake.js';


// Fonction pour vérifier si un champ existe déjà dans la base de données
const checkIfExists = async (field, value) => {
    const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS WHERE ${field} = ?`;
    const result = await executeQuery(query, [value]);
    return result[0].COUNT > 0;  // Retourne vrai si l'élément existe déjà
};

const addDoctor = async (req, res) => {
    try {
        const {DOCTOR_LICENCE, EMAIL, PASSWORD, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, STATUS, CREATED_AT, CREATED_BY } = req.body;
        const imageFile = req.file; // Si l'image est présente dans req.file
        // Tu peux décider de la façon dont tu veux gérer l'image
        const IMAGE = imageFile ? imageFile.path : null;  // Enregistres le chemin de l'image dans la base de données
        // checking for all data :
        if (!DOCTOR_LICENCE || !EMAIL || !PASSWORD || !NAME || !SPECIALTY || !STATUS || !CREATED_AT || !CREATED_BY || !imageFile) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
      

        const licenceExists = await checkIfExists('DOCTOR_LICENCE', DOCTOR_LICENCE);
        const emailExists = await checkIfExists('EMAIL', EMAIL);

        if (licenceExists) {
            throw new Error(`Doctor Licence ${DOCTOR_LICENCE} already exists.`);
        }
        if (emailExists) {
            throw new Error(`Email ${EMAIL} already exists.`);
        }

        //validation email format
        if(!validator.isEmail(EMAIL)){
            return res.json({success:false,message:"enter a valid e-mail"})
        }
        // validating password 
        if(!validator.isStrongPassword(PASSWORD)){
            return res.json({success:false,message:" password must have : minLength: 8, minLowercase: 1, minUppercase: 1"})
        }

        // hashing the passwd
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
        const imageUrl = imageUpload.secure_url;

        const createdAt = new Date(Date.now()).toISOString();
        
        // Prépare les données dans un objet
        const doctorData = {
            DOCTOR_LICENCE,
            EMAIL,
            PASSWORD:hashedPassword,
            NAME,
            SPECIALTY,
            IS_PASSWORD_TEMPORARY,
            STATUS,
            CREATED_AT,
            CREATED_BY,
            IMAGE : imageUrl
        };

        // Appel de la fonction insertDoctor avec les données
        await insertDoctor(doctorData);

        res.status(200).json({ message: 'Doctor added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add doctor', details: err.message });
        
    }
};

export { addDoctor };
