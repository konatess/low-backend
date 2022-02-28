import { Router } from 'express';
import dbMethods from '../controllers/databaseMethods.js';
const router = Router();

// used to check username uniqueness
router.get("/unique/:username", async (req, res) => {
    let isUnique = await dbMethods.checkUsernames(req.params.username)
    return res.json({ unique: isUnique })
});

// so far the only updateable user attribute is username
router.put("/:userid", async (req, res) => {
    let updatedUser = await dbMethods.updateUser(req.params.userid, req.body.username);
    if (updatedUser === 0) {
        return res.status(404).end();
    }
    else {
        return res.status(200).end();
    }
});

export default router;