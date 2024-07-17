import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';

import config from '../config.js';
import UsersManager from '../controllers/UsersManagerDB.js';
import { isValidPassword } from '../utils.js';

const localStrategy = local.Strategy;
const manager = new UsersManager();

const initAuthStrategies = () => {
    passport.use('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            try {
                const foundUser = await manager.getUserByEmail(username);

                if (foundUser && isValidPassword(password, foundUser.password)) {
                    const { password, ...filteredFoundUser } = foundUser;
                    return done(null, filteredFoundUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL,
            scope : "user:email"
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const emailsList = profile.emails[0].value || null;
                let email = profile._json?.email || null;

                if (!emailsList && !email) {
                    const response = await fetch('https://api.github.com/user/emails', {
                        headers: {
                            'Authorization': `token ${accessToken}`,
                            'User-Agent': config.APP_NAME
                        }
                    });
                    const emails = await response.json();
                    email = emails.filter(email => email.verified).map(email => ({ value: email.email }));
                }
                
                if (emailsList) {
                    const foundUser = await manager.getUserByEmail(emailsList);
                    if (!foundUser) {
                        const user = {
                            firstName: profile.username,
                            lastName: profile.username,
                            age: 0, //Pongo un 0 en edad por defecto para que no haya problemas con el modelo.
                            email: emailsList,
                            password: 'none' // No lo dejamos vacío porque en el modelo está requerido
                        }
                        const process = await manager.addUser(user);

                        return done(null, process);
                    } else {

                        return done(null, foundUser);

                    }
                } else {
                    return done(new Error('Faltan datos de perfil'), null);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });
        
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
}

export default initAuthStrategies;