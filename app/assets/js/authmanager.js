/**
 * AuthManager
 * 
 * This module aims to abstract login procedures. Results from Mojang's REST api
 * are retrieved through our Mojang module. These results are processed and stored,
 * if applicable, in the config using the ConfigManager. All login procedures should
 * be made through this module.
 * 
 * @module authmanager
 */
// Requirements
const ConfigManager = require('./configmanager')
const LoggerUtil = require('./loggerutil')
const Mojang = require('./mojang')
const Microsoft     = require('./microsoft')
const { v3: uuidv3 } = require('uuid')
const { machineIdSync } = require('node-machine-id')
const { systemPreferences } = require('electron')
const logger = LoggerUtil('%c[AuthManager]', 'color: #a02d2a; font-weight: bold')
const loggerSuccess = LoggerUtil('%c[AuthManager]', 'color: #209b07; font-weight: bold')

async function validateSelectedMojang(selectedAccount) {
    const current = selectedAccount
    if (current.accessToken == 'ImCrakedLOL') {
        return true
    }
    const isValid = await Mojang.validate(current.accessToken, ConfigManager.getClientToken())
    if(!isValid){
        try {
            const session = await Mojang.refresh(current.accessToken, ConfigManager.getClientToken())
            ConfigManager.updateAuthAccount(current.uuid, session.accessToken)
            ConfigManager.save()
        } catch(err) {
            logger.debug('Error while validating selected profile:', err)
            if(err && err.error === 'ForbiddenOperationException'){
                // What do we do?
            }
            logger.log('Account access token is invalid.')
            return false
        }
        loggerSuccess.log('Account access token validated.')
        return true
    } else {
        loggerSuccess.log('Account access token validated.')
        return true
    }
}

async function validateSelectedMicrosoft(selectedAccount) {
    try {
        const current = selectedAccount
        const now = new Date().getTime()
        const MCExpiresAt = Date.parse(current.expiresAt)
        const MCExpired = now > MCExpiresAt

        if(MCExpired) {
            const MSExpiresAt = Date.parse(ConfigManager.getMicrosoftAuth().expires_at)
            const MSExpired = now > MSExpiresAt

            if (MSExpired) {
                const newAccessToken = await Microsoft.refreshAccessToken(ConfigManager.getMicrosoftAuth)
                ConfigManager.updateMicrosoftAuth(newAccessToken.access_token, newAccessToken.expires_at)
                ConfigManager.save()
            }
            const newMCAccessToken = await Microsoft.authMinecraft(ConfigManager.getMicrosoftAuth().access_token)
            ConfigManager.updateAuthAccount(current.uuid, newMCAccessToken.access_token, newMCAccessToken.expires_at)
            ConfigManager.save()

            return true
        } else {
            return true
        }
    } catch (error) {
        return Promise.reject(error)
    }
}

// Functions

/**
 * Add an account. This will authenticate the given credentials with Mojang's
 * authserver. The resultant data will be stored as an auth account in the
 * configuration database.
 * 
 * @param {string} username The account username (email if migrated).
 * @param {string} password The account password.
 * @returns {Promise.<Object>} Promise which resolves the resolved authenticated account object.
 */
exports.addAccount = async function (username, password) {

    console.log(machineIdSync())

    if (password === '') {
        const ret = ConfigManager.addAuthAccount(uuidv3(username + machineIdSync(), uuidv3.DNS), 'ImCrakedLOL', username, username)
        if (ConfigManager.getClientToken() == null) {
            ConfigManager.setClientToken('ImCrakedLOL')
        }
        ConfigManager.save()
        return ret
    }

    try {
        const session = await Mojang.authenticate(username, password, ConfigManager.getClientToken())
        if (session.selectedProfile != null) {
            const ret = ConfigManager.addAuthAccount(session.selectedProfile.id, session.accessToken, username, session.selectedProfile.name)
            if (ConfigManager.getClientToken() == null) {
                ConfigManager.setClientToken(session.clientToken)
            }
            ConfigManager.save()
            return ret
        } else {
            throw new Error('NotPaidAccount')
        }

    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Remove an account. This will invalidate the access token associated
 * with the account and then remove it from the database.
 * 
 * @param {string} uuid The UUID of the account to be removed.
 * @returns {Promise.<void>} Promise which resolves to void when the action is complete.
 */
exports.removeAccount = async function(uuid){
    try {
        const authAcc = ConfigManager.getAuthAccount(uuid)
        if (authAcc.accessToken != 'ImCrakedLOL') {
            await Mojang.invalidate(authAcc.accessToken, ConfigManager.getClientToken())
        }
        ConfigManager.removeAuthAccount(uuid)
        ConfigManager.save()
        return Promise.resolve()
    } catch (err){
        return Promise.reject(err)
    }
}

/**
 * Validate the selected account with Mojang's authserver. If the account is not valid,
 * we will attempt to refresh the access token and update that value. If that fails, a
 * new login will be required.
 * 
 * **Function is WIP**
 * 
 * @returns {Promise.<boolean>} Promise which resolves to true if the access token is valid,
 * otherwise false.
 */
exports.validateSelected = async function(){
    const selectedAccount = ConfigManager.getSelectedAccount()
    if (selectedAccount.type === 'microsoft') {
        const validate = await validateSelectedMicrosoft(selectedAccount)
        return validate
    } else {
        const validate = await validateSelectedMojang(selectedAccount)
        return validate
    }
  }

exports.addMSAccount = async authCode => {
    try {
        const accessToken = await Microsoft.getAccessToken(authCode)
        ConfigManager.setMicrosoftAuth(accessToken)
        const MCAccessToken = await Microsoft.authMinecraft(accessToken.access_token)
        const MCProfile = await Microsoft.getMCProfile(MCAccessToken.access_token)
        const ret = ConfigManager.addAuthAccount(MCProfile.id, MCAccessToken.access_token, MCProfile.name, MCProfile.name, MCAccessToken.expires_at, 'microsoft')
        ConfigManager.save()

        return ret
    } catch(error) {
        return Promise.reject(error)
    }
}