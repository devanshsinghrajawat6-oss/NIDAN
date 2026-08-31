const { connectDB, Patient } = require('./_db');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectDB();

        if (req.method === 'GET') {
            const patients = await Patient.find({}).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: patients });
        }

        if (req.method === 'POST') {
            const body = req.body;
            // Generate a random pseudonymized ID
            const pseudoId = Math.random().toString(36).substring(2, 10);
            // Mock blockchain tx hash
            const txHash = "0x" + Math.random().toString(16).substring(2, 12);
            
            const newPatient = new Patient({
                patientId: body.patientId,
                pseudonymizedId: pseudoId,
                trialId: body.trialId,
                site: body.site,
                consentStatus: body.consentStatus || 'Consented',
                consentDate: new Date(),
                blockchainTxHash: txHash
            });

            await newPatient.save();
            return res.status(201).json({ success: true, data: newPatient });
        }

        res.status(405).json({ success: false, error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Patient API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
