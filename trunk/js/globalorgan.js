   // 查找指定的元素在数组中的位置
   Array.prototype.organIndexOf = function(val, type) {
       for (var i = 0; i < this.length; i++) {
           if (this[i][type] == val[type]) {
               return i;
           }
       }
       return -1;
   };
   // 通过索引删除数组元素
   Array.prototype.organRemove = function(val, type) {
       var index = this.organIndexOf(val, type);
       if (index > -1) {
           this.splice(index, 1);
       }
   };
   var globalOrgan = null;


   function GlobalOrgan() {
       this.globalOrganData = null; //store the data from server;
   }


   GlobalOrgan.getInstance = function() {
       if (this.globalOrgan == null) {
           this.globalOrgan = new GlobalOrgan(); // tree users
           this.globalOrgan.getGlobalOrganData();
       }
       return this.globalOrgan;
   }

   GlobalOrgan.prototype.getGlobalOrganData = function(callback) {
       if (this.globalOrganData == null) {
           //get from remote server
           var url = myUrls.queryDevicesTree(),
               me = this;
           var data = {
               username: userName
           };
           utils.sendAjax(url, data, function(respData) {
               if (respData.status === 0) {
                   me.globalOrganData = respData.rootuser;
                   callback && callback(me.globalOrganData);
               }
           });
       }
       callback && callback(this.globalOrganData);
       return this.globalOrganData;
   };



   GlobalOrgan.prototype.doResuicUserTree = function(userTree, username) {
       var foundUser = null;
       if (userTree) {
           if (userTree.username == username) {
               foundUser = userTree;
           } else {
               var subUsers = userTree.subusers;
               if (subUsers) {
                   for (var i = 0; i < subUsers.length; ++i) {
                       var subUser = subUsers[i];
                       foundUser = this.doResuicUserTree(subUser, username);
                       if (foundUser) {
                           break;
                       }
                   }
               }
           }
       }

       return foundUser;
   }

   GlobalOrgan.prototype.getUserByUserName = function(username) {
       var foundUser = null;
       foundUser = this.doResuicUserTree(this.globalOrganData, username);
       return foundUser;
   };

   GlobalOrgan.prototype.doResuicUserTreeToRemoveUser = function(userTree, username) {

       if (userTree) {
           var subUsers = userTree.subusers;
           if (subUsers) {
               for (var i = 0; i < subUsers.length; ++i) {
                   var subUser = subUsers[i];
                   if (subUser.username == username) {
                       subUsers.splice(i, 1);
                       break;
                   } else {
                       this.doResuicUserTreeToRemoveUser(subUser, username);
                   }
               }
           }
       }

   }

   GlobalOrgan.prototype.getGroupByUserNameAndGroupId = function(username, groupid) {
       var foundGroup = null;
       var foundUser = null;
       foundUser = this.getUserByUserName(username);
       if (foundUser) {
           var groups = foundUser.groups;
           if (groups) {
               groups.forEach(function(group) {
                   if (group.groupid == groupid) {
                       foundGroup = group;
                       return false;
                   }
               })
           }
       }
       return foundGroup;
   };

   //    GlobalOrgan.prototype.getDeviceByDeviceId = function(creater, deviceid) {
   //        var foundDevice = null;

   //        return foundDevice;
   //    };

   GlobalOrgan.prototype.addUser = function(newUser) {
       if (newUser) {
           var creater = newUser.creater;
           var foundUser = this.getUserByUserName(creater);
           if (foundUser) {
               foundUser.subusers.push(newUser);
           }
       }
   };

   GlobalOrgan.prototype.removeUser = function(username) {
       if (username) {
           this.doResuicUserTreeToRemoveUser(this.globalOrganData, username);
       }
   };

   GlobalOrgan.prototype.editUser = function(oldCreater, editUser) {
       if (editUser) {
           var creater = editUser.creater;
           var oldFoundUser = this.getUserByUserName(oldCreater);
           if (oldFoundUser) {
               oldFoundUser.subusers.organRemove(editUser, "username");
           }
           var newFoundUser = this.getUserByUserName(creater);
           if (newFoundUser) {
               newFoundUser.subusers.push(editUser);
           }
       }
   };

   GlobalOrgan.prototype.addGroup = function(creater, newGroup) {
       if (newGroup) {
           var foundUser = this.getUserByUserName(creater);
           if (foundUser) {
               foundUser.groups.push(newGroup);
           }
       }
   };

   GlobalOrgan.prototype.removeGroup = function(creater, groupid) {
       if (groupid > 0) {
           var foundUser = this.getUserByUserName(creater);
           if (foundUser) {
               var groups = foundUser.groups;
               if (groups) {
                   var groupIndex = -1;
                   for (var i = 0; i < groups.length; ++i) {
                       var group = groups[i];
                       if (group.groupid == groupid) {
                           groupIndex = i;
                           break;
                       }
                   }
                   if (groupIndex >= 0) {
                       groups.splice(groupIndex, 1);
                   }
               }
           }
       }
   };

   GlobalOrgan.prototype.editGroup = function(creater, editGroup) {
       var foundUser = this.getUserByUserName(creater);
       if (foundUser) {
           var groups = foundUser.groups;
           if (groups) {
               for (var i = 0; i < groups.length; ++i) {
                   var group = groups[i];
                   if (group.groupid == editGroup.groupid) {
                       group.groupname = editGroup.groupname;
                       break;
                   }
               }

           }
       }
   };


   GlobalOrgan.prototype.addDevice = function(newDevice) {
       var creater = newDevice.creater;
       var groupid = newDevice.groupid;
       if (groupid < 0) {
           groupid = 0;
       }
       var foundGroup = this.getGroupByUserNameAndGroupId(creater, groupid);
       if (foundGroup) {
           foundGroup.push(newDevice);
       }
   };


   GlobalOrgan.prototype.removeDevice = function(creater, groupid, deviceid) {
       console.log(creater, groupid, deviceid);
       if (groupid < 0) {
           groupid = 0;
       }
       var foundGroup = this.getGroupByUserNameAndGroupId(creater, groupid);
       if (foundGroup) {
           //    foundGroup.organRemove(oldDevice, "deviceid");
           var devices = foundGroup.devices;
           if (devices) {
               for (var i = 0; i < devices.length; ++i) {
                   var device = devices[i];
                   if (device.deviceid == deviceid) {
                       devices.splice(i, 1);
                       break;
                   }
               }
           }
       }
   };

   GlobalOrgan.prototype.editDevice = function(editDevice) {
       var creater = editDevice.creater;
       var groupid = editDevice.groupid;
       if (groupid < 0) {
           groupid = 0;
       }
       var foundGroup = this.getGroupByUserNameAndGroupId(creater, groupid);
       if (foundGroup) {
           foundGroup.organRemove(editDevice, "deviceid");
           foundGroup.push(editDevice);
       }
   };