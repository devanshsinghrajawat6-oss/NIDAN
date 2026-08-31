const { connectDB, Trial } = require('./_db');

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
            const trials = await Trial.find({}).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: trials });
        }

        if (req.method === 'POST') {
            const body = req.body;
            
            const newTrial = new Trial({
                trialId: body.trialId,
                name: body.name,
                phase: body.phase,
                status: body.status || 'Active',
                enrollmentCurrent: body.enrollmentCurrent || 0,
                enrollmentTarget: body.enrollmentTarget || 100,
                complianceScore: body.complianceScore || 100,
                principalInvestigator: body.principalInvestigator,
                site: body.site,
                herbFormulation: body.herbFormulation,
                description: body.description,
                iecApprovalStatus: body.iecApprovalStatus || 'Pending',
                iecApprovalDate: body.iecApprovalDate,
                iecExpiryDate: body.iecExpiryDate,
                ctriRegistration: body.ctriRegistration
            });

            await newTrial.save();
            return res.status(201).json({ success: true, data: newTrial });
        }

        res.status(405).json({ success: false, error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Trial API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
