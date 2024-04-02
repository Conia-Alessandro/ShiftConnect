import React from 'react';

function StaffCard({ staff }) {
  const { id, name, surname, biography, casualWorkDepartments, contacts, mainDepartment, photo, supervisor } = staff;

  return (
    <div className="staff-card">
      <img src={photo} alt={`${name} ${surname}`} width={120} height={150}/>
      <h2>{name} {surname}</h2>
      <p>ID: {id}</p>
      <p>Biography: {biography}</p>
      <p>Main Department: {mainDepartment || 'Not assigned / Not a supervisor'}</p>
      <ul>
        <li>Casual Work Departments: {casualWorkDepartments.join(', ')}</li>
      </ul>
      <div>
        <h3>Contacts:</h3>
        <ul>
          {contacts.map((contact, index) => (
            <li key={index}>
              <p>Contact Type: {contact.contactType}</p>
              <p>Preferred Time: {contact.preferredTime}</p>
              <p>Value: {contact.value}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Supervisor: {supervisor ? 'Yes' : 'No'}</h3>
      </div>
      
    </div>
  );
}

export default StaffCard;
