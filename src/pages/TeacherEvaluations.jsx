import React from 'react';
import TeacherLayout from '../components/TeacherLayout';
import SaisieNotes from './SaisieNotes';

// Cette page reste pour l'accès direct à la saisie de notes
export default function TeacherEvaluations() {
  return (
    <TeacherLayout title="Évaluations" subtitle="Saisie des notes">
      <SaisieNotes />
    </TeacherLayout>
  );
}

