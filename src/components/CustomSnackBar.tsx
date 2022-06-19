import { Snackbar } from "@mui/material";
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import React from 'react';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={5} ref={ref} variant="filled" {...props} />;
});

function CustomSnackBar(props: any) {
    return (
        <div>
            <Snackbar
                open={true}
                autoHideDuration={props.duration}
                onClose={props.closeSnackBar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={props.closeSnackBar} severity={props.type} sx={{ width: '100%' }}>{props.snackBarMessage}</Alert>
            </Snackbar>
        </div >
    );
};

export default CustomSnackBar;
