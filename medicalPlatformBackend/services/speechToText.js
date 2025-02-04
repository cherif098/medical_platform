import fs from "fs";
import path from "path";
import speech from "@google-cloud/speech";
import ffmpeg from "fluent-ffmpeg";

const client = new speech.SpeechClient();

const convertToLinear16 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("pcm_s16le")
      .audioChannels(1)
      .audioFrequency(16000)
      .format("wav")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};

export const transcribeAudio = async (filePath, languageCode = "fr-FR") => {
  try {
    const outputPath = path.join("uploads", "converted_" + path.basename(filePath));
    await convertToLinear16(filePath, outputPath);

    const audio = {
      content: fs.readFileSync(outputPath).toString("base64"),
    };

    const config = {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "fr-FR",
      alternativeLanguageCodes: ["en-US"],
      enableAutomaticPunctuation: true,
      useEnhanced: true,
      model: "default",
      speechContexts: [
        {
          phrases: [
            "constantes vitales",
            "pression artérielle",
            "bilan sanguin",
            "médicament",
            "diagnostic",
            "traitement",
            "symptômes",
            "examen clinique",
            "radiographie",
            "échographie",
            "numération formule sanguine",
            "glycémie",
            "cholestérol",
            "tachycardie",
            "bradycardie",
            "douleur thoracique",
            "antibiotique",
            "immunothérapie",
            "infirmière",
            "docteur",
          ],
          boost: 20.0, 
        },
      ],
    };
    
    

    const request = { audio, config };

    const [response] = await client.recognize(request);
    fs.unlinkSync(outputPath);

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    return transcription;
  } catch (error) {
    console.error("Error during transcription:", error);
    throw new Error("Transcription failed");
  }
};
