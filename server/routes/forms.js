const express = require("express");


const router = express.Router();

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `${Date.now()}-${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: "uploads",
            };
            resolve(fileInfo);
        });
    },
});
const upload = multer({ storage });


router.get("/profile", async (req, res) => {
    try {
        const userId = req.query.userId; 
        if (!users[userId]) return res.status(404).json({ error: "User not found" });

        res.json(users[userId]);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 UPDATE USER PROFILE (General Info)
router.post("/update", async (req, res) => {
    try {
        const { userId, name, email, address, mobileNo, instituteName, areaOfSpecialization, DBTproj_ong, DBTproj_completed, Proj_ong, Proj_completed } = req.body;
        
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        users[userId] = {
            name, email, address, mobileNo, instituteName, areaOfSpecialization, DBTproj_ong, DBTproj_completed, Proj_ong, Proj_completed
        };

        res.json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/upload/:type/:proposalId", upload.single("file"), async (req, res) => {
    try {
        const { type, proposalId } = req.params;
        if (!["photo", "pdf"].includes(type)) return res.status(400).json({ message: "Invalid file type" });

        res.json({
            success: true,
            message: `${type} uploaded successfully`,
            filePath: req.file.path,
            proposalId
        });
    } catch (error) {
        res.status(500).json({ message: "File upload failed", error: error.message });
    }
});

router.get("/file/:filename", async (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }
        
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

module.exports = router;
