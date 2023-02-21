import { User } from "../models/user.model";
import functions = require("firebase-functions");

import fbAdmin = require("firebase-admin");
fbAdmin.initializeApp()
var fbDB = fbAdmin.firestore()


export const getUsers = async (): Promise<User[]> => {
    try {
        const snapshot = await fbDB.collection('users').get();
        return snapshot.docs.map((doc: any) => {
            const user = doc.data() as User;
            user.id = doc.id;
            return user;
        });
    } catch (error: any) {
        throw error;
    }
}

export const saveUsers = async (users: User[]): Promise<string> => {
    try {
        let querySnapshot = await fbDB.collection('users').get()

        if (querySnapshot.size === 0) {
            functions.logger.info('No documents to update');
            return 'No documents to update'
        }

        const batches: any[] = [] // hold batches to update at once

        querySnapshot.docs.forEach((doc, i) => {
            batches.push(fbDB.batch())

            const batch = batches[batches.length - 1]
            const currentUser = users.find(user => user.id = doc.id)
            batch.update(doc.ref, { "dealGroups": currentUser?.dealGroups })
        })

        await Promise.all(batches.map(batch => batch.commit()))
        functions.logger.info(`${querySnapshot.size} documents updated`);
        return `${querySnapshot.size} documents updated`
    }
    catch (error: any) {
        functions.logger.info(`***ERROR: ${error}`);
        return error
    }
}