/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== LODASH ================================================================
import isEmpty from 'lodash/isEmpty';

// ===== STORES ================================================================
import Store from './store';

// ===== MODELS ================================================================
import User from '../models/user';

/**
 * Stores User data
 */
class UserStore extends Store {
  insert(username, password, messengerId?) {
    const user = new User(
      username,
      password,
      messengerId,
    );
    this.set(username, user);
    return user;
  }

  /**
   * Insert an updated user only if it currently exists in the store
   *
   * @param {String} username     Username of the user to update
   * @param {Object} updateObject Updated user properties
   * @returns {Object} User model
   */
  update(username, updateObject) {
    const currentUser = this.get(username);
    if (!currentUser) { return {}; }

    const updatedUser = Object.assign({}, currentUser, updateObject);
    this.set(username, updatedUser);
    return updatedUser;
  }

  /**
   * Get a user by their unique Messenger id
   *
   * @param {String} messengerId MessengerId obtained via account_link
   * @returns {Object} User model
   */
  getByMessengerId(messengerId) {
    let currentUser = {};
    this.data.forEach((userData) => {
      if (userData.messengerId === messengerId) {
        currentUser = userData;
      }
    });
    return currentUser;
  }

  /**
   * Add a messenger id to a user in the system
   *
   * @param {String} username    Username of the user to link
   * @param {String} messengerId Messenger id to link to user
   * @returns {Object} User model
   */
  linkMessengerAccount(username, messengerId) {
    return this.update(username, { messengerId });
  }

  /**
   * Remove a messenger id from a user in the system
   *
   * @param {String} messengerId Messenger id remove from user
   * @returns {Object} User model
   */
  unlinkMessengerAccount(messengerId) {
    const currentUser = this.getByMessengerId(messengerId) as any;
    if (isEmpty(currentUser)) { return currentUser; }

    return this.update(currentUser.username, {
      messengerId: undefined,
    });
  }

  /**
   * Replace the temporary uuid auth token set during the account_link
   * redirect with a permanent Messenger Id
   *
   * @param {String} authToken   Temporary token to replace
   * @param {String} messengerId Messenger id to link to user
   * @returns {Object} User model
   */
  replaceAuthToken(authToken, messengerId) {
    const currentUser = this.getByMessengerId(authToken) as any;
    if (isEmpty(currentUser)) { return currentUser; }

    return this.linkMessengerAccount(currentUser.username, messengerId);
  }
}

const USER_STORE = new UserStore();

// add demo account
USER_STORE.insert('foo', 'bar');

// export an instantiated user store.
export default USER_STORE;
