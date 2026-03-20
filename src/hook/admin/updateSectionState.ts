import {ObjectId} from "bson";
import axios from "axios";

export default async function updateSectionState(
    moduleId: string | ObjectId,
    order: number,
    key: 'isAvailable' | 'correctionIsAvailable' | 'examenIsLock',
    value: boolean
) {

    await axios.put(`/api/admin/${moduleId}/sections/${order}`,
        {key, value},
        {headers: {'Content-Type': 'application/json'}}
    );

    return {success: true};

}