import logger from '@overleaf/logger'
import http from 'node:http'
import https from 'node:https'
import Settings from '@overleaf/settings'
import TpdsUpdateSender from '../ThirdPartyDataStore/TpdsUpdateSender.mjs'
import TpdsProjectFlusher from '../ThirdPartyDataStore/TpdsProjectFlusher.mjs'
import EditorRealTimeController from '../Editor/EditorRealTimeController.js'
import SystemMessageManager from '../SystemMessages/SystemMessageManager.mjs'
import AuthenticationManager from '../Authentication/AuthenticationManager.js'

// 🔹 새로 추가된 모듈
import UserCreator from '../User/UserCreator.mjs'
import UserDeleter from '../User/UserDeleter.mjs'
import UserGetter from '../User/UserGetter.js'

const AdminController = {
  _sendDisconnectAllUsersMessage: delay => {
    return EditorRealTimeController.emitToAll(
      'forceDisconnect',
      'Sorry, we are performing a quick update to the editor and need to close it down. Please refresh the page to continue.',
      delay
    )
  },

  index(req, res, next) {
    let url
    const openSockets = {}
    for (url in http.globalAgent.sockets) {
      openSockets[`http://${url}`] = http.globalAgent.sockets[url].map(
        socket => socket._httpMessage.path
      )
    }
    for (url in https.globalAgent.sockets) {
      openSockets[`https://${url}`] = https.globalAgent.sockets[url].map(
        socket => socket._httpMessage.path
      )
    }

    SystemMessageManager.getMessagesFromDB((err, systemMessages) => {
      if (err) return next(err)
      UserGetter.getUsers({}, { email: 1, name: 1, isAdmin: 1 }, (error, users) => {
        if (error) return next(error)
        res.render('admin/index', {
          title: 'System Admin',
          openSockets,
          systemMessages,
          users,
        })
      })
    })
  },

  createUser(req, res, next) {
    const { email, name, password, role } = req.body
    const isAdmin = role === 'admin'

    const userAttributes = {
      email,
      name,
      first_name: name,
      password, // 임시 저장
      isAdmin,
    }

    const options = { confirmedAt: new Date() }

    // 1️⃣ 사용자 생성
    UserCreator.createNewUser(userAttributes, options, async (err, user) => {
      if (err) {
        logger.error('User creation failed:', err)
        return next(err)
      }

      try {
        // 2️⃣ 비밀번호 해시 적용
        await AuthenticationManager.promises.setUserPassword(user, password)
        logger.info({ email: user.email }, 'Admin created user and hashed password')
        res.redirect('/admin#user-management')
      } catch (hashErr) {
        logger.error('Password hashing failed:', hashErr)
        next(hashErr)
      }
    })
  },
  deleteUser(req, res, next) {
    const { userId } = req.body
    const options = {
      deleterUser: req.user,
      ipAddress: req.ip,
      skipEmail: true,
      force: true,
    }

    UserDeleter.deleteUser(userId, options, err => {
      if (err) {
        logger.error('User deletion failed:', err)
        return next(err)
      }
      logger.info(`Admin deleted user ${userId}`)
      res.redirect('/admin#user-management')
    })
  },
  disconnectAllUsers(req, res) {
    logger.warn('disconecting everyone')
    const delay = (req.query && req.query.delay) > 0 ? req.query.delay : 10
    AdminController._sendDisconnectAllUsersMessage(delay)
    res.redirect('/admin#open-close-editor')
  },

  openEditor(req, res) {
    logger.warn('opening editor')
    Settings.editorIsOpen = true
    res.redirect('/admin#open-close-editor')
  },

  closeEditor(req, res) {
    logger.warn('closing editor')
    Settings.editorIsOpen = req.body.isOpen
    res.redirect('/admin#open-close-editor')
  },

  flushProjectToTpds(req, res, next) {
    TpdsProjectFlusher.flushProjectToTpds(req.body.project_id, error => {
      if (error) return next(error)
      res.sendStatus(200)
    })
  },

  pollDropboxForUser(req, res) {
    const { user_id: userId } = req.body
    TpdsUpdateSender.pollDropboxForUser(userId, () => res.sendStatus(200))
  },

  createMessage(req, res, next) {
    SystemMessageManager.createMessage(req.body.content, error => {
      if (error) return next(error)
      res.redirect('/admin#system-messages')
    })
  },

  clearMessages(req, res, next) {
    SystemMessageManager.clearMessages(error => {
      if (error) return next(error)
      res.redirect('/admin#system-messages')
    })
  },
}

export default AdminController