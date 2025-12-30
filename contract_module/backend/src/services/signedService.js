import crypto from 'crypto';

export const createSigned = async (client, id, status_type_id) => {
    try {
        // Cambiar de signatureHash a signature
        const { signature, salt } = createSignature(id);

        const query = `INSERT INTO signed(
            contract_base_id,
            base_addition_id,
            status_type_id,
            security_hash,
            creation_date,
            salt
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

        const values = [
            id, // No uses || null, si id es undefined debería fallar
            null,
            status_type_id,
            signature, // Usar signature en lugar de signatureHash
            new Date().toISOString().slice(0, 10),
            salt
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        console.error("Error en createSigned:", error);
        throw error;
    }
}

export const updateSigned = async (client, data) => {
    try {
        const query = `UPDATE signed SET
        contract_base_id = $1,
        base_addition_id = $2,
        security_hash = $3,
        creation_date = $4,
        salt = $5,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *`;

        const values = [
            data.SG_contract_base_id,
            data.SG_base_addition_id,
            data.SG_security_hash,
            data.SG_creation_date,
            data.SG_salt,
            data.SG_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];

    } catch (error) {
        throw error;
    }
}





function createSignature(id) {
    // const secret = process.env.SECRET_SIGNATURE_KEY;
    const secret = "y3&M{f@.'B&>)$1ea;*z&s(>-kUY9c44F3-MRnA}}]"
    const salt = crypto.randomInt(100000, 999999);

    const data = `${id}|${new Date().toISOString().slice(0, 10)}|${salt}`;

    return {
        signature: crypto
            .createHmac("sha256", secret)
            .update(data)
            .digest("hex"),
        salt
    };
}