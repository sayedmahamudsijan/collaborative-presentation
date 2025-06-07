import React from 'react';
   import socket from '../socket';

   function UserPanel({ users, isCreator, presentationId }) {
       const toggleRole = (user) => {
           if (!isCreator) return;
           const newRole = user.role === 'editor' ? 'viewer' : 'editor';
           socket.emit('update_role', { presentationId, nickname: user.nickname, role: newRole });
       };

       return (
           <div className="w-64 bg-gray-200 p-4">
               <h3 className="text-lg mb-2">Users</h3>
               <ul>
                   {users.map((user) => (
                       <li key={user.id} className="flex justify-between">
                           {user.nickname} ({user.role})
                           {isCreator && (
                               <button
                                   className="bg-blue-500 text-white p-1 rounded text-sm"
                                   onClick={() => toggleRole(user)}
                               >
                                   Toggle Role
                               </button>
                           )}
                       </li>
                   ))}
               </ul>
           </div>
       );
   }

   export default UserPanel;