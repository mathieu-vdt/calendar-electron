// get the client
const { createConnection, RowDataPacket } = require('mysql2');
import { IUser } from '../../interfaces/user';

// create the connection to database 
const connection = createConnection({
    host: 'localhost',
    user: 'root',
    database: 'user'
});

export function getAll(): Promise<IUser[]> {
    return new Promise((resolve, rej) => {
        connection.query('SELECT * FROM user',
            (err: Error, res: typeof RowDataPacket[]) => {
                if (err) rej(err)
                else resolve(res as IUser[])
            })
    })
}
export function getById(id: number) {
    return new Promise((resolve, rej) => {
        connection.query('SELECT * FROM user WHERE id=?',
            [id],
            (err: Error, res: typeof RowDataPacket[]) => {
                if (err) rej(err)
                else resolve(res[0] as IUser)
            })
    })
}
export function addUser(user: IUser) {
    return new Promise((resolve, rej) => {
        connection.query('INSERT INTO user (prenom,nom) VALUES (?,?)',
            [user.prenom, user.nom],
            (err: Error) => {
                if (err) rej(err)
                else resolve("Utilisateur ajouté")
            })
    })
}

export function updUser(user: IUser) {
    return new Promise((resolve, rej) => {
        connection.query('UPDATE user SET prenom=?,nom=? WHERE id=?',
            [user.prenom, user.nom, user.id],
            (err: Error) => {
                if (err) rej(err)
                else resolve("Utilisateur modifié")
            })
    })
}
export function delUser(id: number) {
    return new Promise((resolve, rej) => {
        connection.query('DELETE FROM user WHERE id=?',
            [id],
            (err: Error) => {
                if (err) rej(err)
                else resolve("Utilisateur supprimé")
            })
    })
}