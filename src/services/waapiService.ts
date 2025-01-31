import axios from 'axios';

function removeNinthDigit(phoneNumber: string | number): string {
    const phoneStr = phoneNumber.toString();

    if (!phoneStr.startsWith('55')) {
        return phoneStr;
    }
    const countryCode = phoneStr.slice(0, 2); // '55'
    const areaCode = phoneStr.slice(2, 4);    // Next 2 digits for area code

    const restOfNumber = phoneStr.slice(4);

    if (restOfNumber.length === 9 && restOfNumber.startsWith('9')) {
        const modifiedNumber = restOfNumber.slice(1); // Remove the first character

        return countryCode + areaCode + modifiedNumber;
    }

    return phoneStr;
}


export class WaAPIService {
    private readonly token: string;
    private readonly instance: string;
    private readonly headers: Record<string, string>;
    private readonly supportNumber: string;

    constructor() {
        this.token = process.env.NEXT_PUBLIC_WAAPI_TOKEN || '';
        this.instance = process.env.NEXT_PUBLIC_WAAPI_INSTANCE || '';
        this.supportNumber = '556296163339';
        this.headers = {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }

    /**
     * Sends a message to both the original and modified phone numbers.
     * @param number The recipient's phone number.
     * @param message The message to send.
     * @returns Promise<boolean> indicating success if both messages are sent successfully.
     */
    async sendMessage(number: string, message: string): Promise<boolean> {
        try {
            // Prepare both numbers
            const originalNumber = number.toString();
            const modifiedNumber = removeNinthDigit(number);

            // Prepare payloads
            const payloadOriginal = {
                chatId: `${originalNumber}@c.us`,
                message: message,
            };

            const payloadModified = {
                chatId: `${modifiedNumber}@c.us`,
                message: message,
            };

            // Define the endpoint
            const endpoint = `https://waapi.app/api/v1/instances/${this.instance}/client/action/send-message`;
            const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

            // Send both messages in parallel
            const responseOriginal = await axios.post(endpoint, payloadOriginal, { headers: this.headers });

            // Wait for 1 seconds (1000 milliseconds)
            await sleep(1000);

            // Make the second POST request
            const responseModified = await axios.post(endpoint, payloadModified, { headers: this.headers });

            // Check both responses
            let success = true;

            if (responseOriginal.data.status === 'success') {
                console.log(`Message sent to original number ${originalNumber}`);
            } else {
                console.error(`Failed to send message to original number ${originalNumber}. Response status: ${responseOriginal.data.status}`);
                success = false;
            }

            // Check modified number response
            if (responseModified.data.status === 'success') {
                console.log(`Message sent to modified number ${modifiedNumber}`);
            } else {
                console.error(`Failed to send message to modified number ${modifiedNumber}. Response status: ${responseModified.data.status}`);
                success = false;
            }

            return success;
        } catch (error) {
            console.error('Error sending messages:', error);
            return false;
        }
    }

    async callSupport(): Promise<boolean> {
        try {
            const payload = {
                chatId: `${this.supportNumber}@c.us`,
                message: 'Suporte necessário: app Faithful_Line',
            };
            const endpoint = `https://waapi.app/api/v1/instances/${this.instance}/client/action/send-message`;
            const response = await axios.post(endpoint, payload, {
                headers: this.headers,
            });
            if (response.status === 200) {
                console.log('Support called successfully');
                return true;
            } else {
                console.error(`Failed to call support. Status code: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error('Error calling support:', error);
            return false;
        }
    }
}
