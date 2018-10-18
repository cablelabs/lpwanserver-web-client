import sessionStore from './stores/SessionStore'
import userStore from './stores/UserStore'
import companyStore from './stores/CompanyStore'

sessionStore.on('session-started', () => {
  userStore.getUserMe()
})

userStore.on('get-user-me', u => {
  sessionStore.user = u
  companyStore.getCompany(u.companyId)
})

companyStore.on('get-company', company => {
  if (company.id !== sessionStore.user.companyId) return
  sessionStore.company = company
  sessionStore.saveMeToStore()
  sessionStore.emit('session-data-loaded')
  sessionStore.emit('change')
})