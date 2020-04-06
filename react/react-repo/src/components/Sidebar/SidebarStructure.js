import React from 'react'
import {
    Home as HomeIcon,
    Chat as ChatIcon,
    Add as AddSectionIcon,
} from '@material-ui/icons'
import { makeStyles } from '@material-ui/styles'
import Dot from './components/Dot'
// components


const structure = [
    {
        id: 23,
        label: 'Create A New Game',
        icon: <AddSection />,
        click: function(event, ...rest) {
            const name = 'addSectionClick'
            rest.forEach(c => {
                if (c.clickName === name) {
                    return c(event)
                }
                return false
            })
        },
    },
    {
        id: 24,
        label: 'Join Existing Game',
        icon: <AddSection />,
        click: function(event, ...rest) {
            const name = 'addSectionClick'
            rest.forEach(c => {
                if (c.clickName === name) {
                    return c(event)
                }
                return false
            })
        },
    },
    { id: 3, type: 'divider' },
    {
        id: 28,
        label: '',
        icon: <Chat />,
        click: function(event, ...rest) {
            const name = 'chatSetOpen'
            rest.forEach(c => {
                if (c.clickName === name) {
                    return c(event)
                }
                return false
            })
        },
    },
    
]

function AddSection() {
    const useStyles = makeStyles(theme => ({
        root: {
            backgroundColor: theme.palette.secondary.main,
            borderRadius: '50%',
            height: 30,
            width: 30,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
        },
    }))

    const classes = useStyles()

    return (
        <section className={classes.root}>
            <AddSectionIcon />
        </section>
    )
}
function Chat() {
    const useStyles = makeStyles(theme => ({
        root: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%',
            height: 45,
            width: 45,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
        },
    }))

    const classes = useStyles()

    return (
        <>
            <section className={classes.root}>
                <ChatIcon />
            </section>
        </>
    )
}

export default structure
