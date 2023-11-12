import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, IconButton, Slide, TextareaAutosize } from '@mui/material';
import { Close, List } from '@mui/icons-material';
import { useRef } from 'react';
import React from 'react';
import { TransitionProps } from 'react-transition-group/Transition';

export default function ExistingTestEditPage(props: any) {

    const textAreaRef = useRef(null);

    const populate = () => {
        props.closeDialog(textAreaRef.current.value)
    };

    const Transition = React.forwardRef(function Transition(
        props: TransitionProps & {
            children: React.ReactElement;
        },
        ref: React.Ref<unknown>,
    ) {
        return <Slide direction="up" ref={ref} {...props} />;
    });

    return (
        <Dialog maxWidth={'xl'} open={true} onClose={populate} TransitionComponent={Transition}>
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                Paste an existing test case content in the text box and click button to populate the steps.
                <IconButton onClick={populate}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText align='center'>
                    <TextareaAutosize minRows={10} ref={textAreaRef} style={{ width: '95%' }} />
                </DialogContentText>
            </DialogContent>
            <Box alignSelf={'center'} marginBottom={'1rem'}>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ textTransform: 'none', backgroundColor: 'green' }}
                    startIcon={<List />}
                    onClick={populate}
                >
                    Populate Steps
                </Button>
            </Box>
        </Dialog>
    );
}
