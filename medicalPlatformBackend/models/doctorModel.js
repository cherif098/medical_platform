const snowflake = require('snowflake-sdk');

const connection = snowflake.createConnection({
    account: 'your_account',
    username: 'your_username',
    password: 'your_password',
    warehouse: 'your_warehouse',
    database: 'your_database',
    schema: 'your_schema'
});

async function insertDoctor(doctor) {
    const {
        name,
        email,
        password,
        image,
        speciality,
        degree,
        experience,
        about,
        available,
        fees,
        address,
        date,
        slots_booked,
    } = doctor;

    const query = `
        INSERT INTO doctors (id, name, email, password, image, speciality, degree, experience, about, available, fees, address, date, slots_booked)
        VALUES (UUID_STRING(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        name,
        email,
        password,
        image,
        speciality,
        degree,
        experience,
        about,
        available,
        fees,
        JSON.stringify(address),
        date,
        JSON.stringify(slots_booked),
    ];

    try {
        await connection.execute({
            sqlText: query,
            binds: values,
        });
        console.log('Doctor added successfully');
    } catch (err) {
        console.error('Error inserting doctor:', err);
    }
}

// Example usage:
const newDoctor = {
    name: 'Dr. Jane Doe',
    email: 'jane.doe@example.com',
    password: 'securepassword',
    image: 'http://example.com/image.jpg',
    speciality: 'Pediatrics',
    degree: 'MD',
    experience: '8 years',
    about: 'Dedicated pediatrician...',
    available: true,
    fees: 120,
    address: { street: '456 Elm St', city: 'Othertown', state: 'NY', zip: '67890' },
    date: Date.now(),
    slots_booked: {},
};

insertDoctor(newDoctor);