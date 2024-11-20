import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

const MyProfile = () => {
  const {patientData, setPatientData} = useContext(AppContext);
  console.log(patientData);

  const [isEdit, setIsEdit] = useState(true);

  return patientData && (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      <img className="w-36 rounded-full" src={patientData.IMAGE} alt="" />
      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          value={patientData.NAME}
          onChange={(e) =>
            setPatientData((prev) => ({ ...prev, NAME: e.target.value }))
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {patientData.NAME}
        </p>
      )}
      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div className=" grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500 cursor-pointer">{patientData.EMAIL}</p>
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className=" bg-gray-100 max-w-52"
              type="text"
              value={patientData.PHONE}
              onChange={(e) =>
                setPatientData((prev) => ({ ...prev, PHONE: e.target.value }))
              }
            />
          ) : (
            <p className="text-blue-500 cursor-pointer">{patientData.PHONE}</p>
          )}
          <p className="font-medium">Adresse:</p>
            {isEdit ? (
              <input
                className="bg-gray-50"
                onChange={(e) =>
                  setPatientData((prev) => ({
                    ...prev,
                    ADRESSE: e.target.value, // Met à jour directement la propriété ADRESSE
                  }))
                }
                value={patientData.ADRESSE} // Utilise la valeur directe d'ADRESSE
                type="text"
              />
            ) : (
              <p className="text-gray-500">{patientData.ADRESSE}</p> // Affiche simplement la valeur de l'adresse
            )}
        </div>
        <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              onChange={(e) =>
                setPatientData((prev) => ({ ...prev, GENDER: e.target.value }))
              }
              value={patientData.GENDER}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          ) : (
            <p className="text-gray-400">{patientData.GENDER}</p>
          )}
          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="maz-w-28 bg-gray-100"
              onChange={(e) =>
                setPatientData((prev) => ({ ...prev, DATE_OF_BIRTH: e.target.value }))
              }
              value={patientData.DATE_OF_BIRTH}
              type="date"
            />
          ) : (
            <p className="text-gray-500">{patientData.DATE_OF_BIRTH}</p>
          )}
        </div>
      </div>
      <div className="mt-10">
        {isEdit ? (
          <button
            className="border border-primary px-8 rounded-full hover:bg-primary hover:text-while transition-all "
            onClick={() => setIsEdit(false)}
          >
            Save information
          </button>
        ) : (
          <button
            className="border border-primary px-8 rounded-full hover:bg-primary hover:text-while transition-all"
            onClick={() => setIsEdit(true)}
          >
            {" "}
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
