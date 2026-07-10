import React from 'react';
import TeacherLayout from '../components/TeacherLayout';
import Messages from './Messages';

export default function TeacherMessages() {
  return (
    <TeacherLayout title="Messages" subtitle="Messagerie interne">
      <Messages noLayout={true} />
    </TeacherLayout>
  );
}
