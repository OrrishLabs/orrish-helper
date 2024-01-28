import { ContentCopy } from '@mui/icons-material';
import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import CryptoJS from 'crypto-js';
import { useState } from 'react';
import CustomSnackBar from '../components/CustomSnackBar';

const OthersPage = () => {
    let keyString = 'AutomationSecret';

    const [shouldResultDisplay, setShouldResultDisplay] = useState(false);
    const [textBoxValue, setTextBoxValue] = useState('');
    const [cryptedValue, setCryptedValue] = useState('');
    const [buttonClicked, setButtonClicked] = useState('');
    const [snackBarDeatails, setSnackBarDetails] = useState({ type: 'info', duration: 6000, text: '' });

    const handleTextBoxChange = (event) => {
        setTextBoxValue(event.target.value);
        setShouldResultDisplay(false);
    };

    //Reference : https://www.c-sharpcorner.com/UploadFile/4d9083/encrypt-in-javascript-and-decrypt-in-C-Sharp-with-aes-algorithm/
    const encrypt = () => {
        setButtonClicked('encrypt');
        setShouldResultDisplay(true);
        let keyAndIv = CryptoJS.enc.Utf8.parse(keyString);
        var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(textBoxValue), keyAndIv, {
            keySize: 128 / 8,
            iv: keyAndIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        setCryptedValue(encrypted.toString());
    };

    const decrypt = () => {
        setButtonClicked('decrypt');
        setShouldResultDisplay(true);
        let keyAndIv = CryptoJS.enc.Utf8.parse(keyString);
        var decrypted = CryptoJS.AES.decrypt(textBoxValue, keyAndIv, {
            keySize: 128 / 8,
            iv: keyAndIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        setCryptedValue(decrypted.toString(CryptoJS.enc.Utf8));
    };

    const onCopyValue = () => {
        var textArea = document.createElement('textarea');
        document.getElementById('otherDialog').appendChild(textArea);
        textArea.value = cryptedValue;
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        setSnackBarDetails({ type: 'success', duration: 6000, text: 'Copied ' + buttonClicked + 'ed value to clipboard.' });
        document.getElementById('otherDialog').removeChild(textArea);
    };

    const closeSnackBar = () => {
        //This is needed for re-rendering on clicking same button again.
        setSnackBarDetails({ type: 'info', duration: 6000, text: '' });
    };

    return (
        <div id="otherDialog" style={{ margin: '20px 200px' }}>
            <p>
                You can encrypt/decrypt text here to put in test cases. This is useful for avoiding plain text password etc. in the test case.
            </p>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '20px' }}>
                <TextField onChange={handleTextBoxChange} fullWidth id="standard-basic" label="Enter value to encrypt/decrypt" variant="standard" />
                <Button disabled={textBoxValue.trim().length === 0} onClick={() => encrypt()} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Encrypt
                </Button>
                <Button disabled={textBoxValue.trim().length === 0} onClick={() => decrypt()} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Decrypt
                </Button>
            </div>
            {shouldResultDisplay && (
                <div style={{ margin: '20px', alignContent: 'center' }}>
                    <span>The {buttonClicked}ed value is : </span>
                    <span>{cryptedValue}</span>
                    <Tooltip title="Copy this step to clipboard.">
                        <IconButton size="small" onClick={onCopyValue}>
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                </div>
            )}
            {snackBarDeatails.text.length > 0 && (
                <CustomSnackBar snackBarMessage={snackBarDeatails.text} duration={snackBarDeatails.duration} type={snackBarDeatails.type} closeSnackBar={closeSnackBar} />
            )}
        </div>
    );
};

export default OthersPage;
