import React from 'react'
import { Route, withRouter } from 'react-router-dom'
import classnames from 'classnames'
import useStyles from './styles'
import Header from '../Header'
import Sidebar from '../Sidebar'
import Dashboard from '../../pages/dashboard'
import { useLayoutState } from '../../context/LayoutContext'
import structure from '../Sidebar/SidebarStructure'
import { SocketProvider } from 'socket.io-react';
import io from 'socket.io-client';




function Layout(props) {
    const classes = useStyles()
    const socket = io.connect('localhost:8080');
    // const testSockets = Array(4).fill(null).map(() => io.connect('localhost:8080'))
    // testSockets.forEach((testSocket) => {
    //   testSocket.on('connect', () => console.log("socket:", testSocket.id))
    // })
    socket.on('connect', () => console.log("socket:", socket.id));
    // socket.emit("startGame", "testGame2", (success) => {
    //   console.log(success)
    // })
    // global
    var layoutState = useLayoutState()

    return (
        <div className={classes.root}>
            <Header history={props.history} />
            <Sidebar structure={structure} />
            <div
                className={classnames(classes.content, {
                    [classes.contentShift]: layoutState.isSidebarOpened,
                })}
            >
                <div className={classes.fakeToolbar} />
                <SocketProvider
                  socket={socket}
                >
                    <Route path="/app/dashboard" render={(props) => <Dashboard {...props} /> }/>
                    </SocketProvider>
            </div>
        </div>
    )
}

export default withRouter(Layout)
