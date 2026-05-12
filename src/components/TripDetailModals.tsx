import ConfirmDialog from './ConfirmDialog'
import TripFormModal from './TripFormModal'
import TripPlaceEditModal from './TripPlaceEditModal'
import type {
  TripInput,
  TripPlaceUpdateInput,
  TripPlaceWithPlace,
  TripWithPlaces,
} from '../types/trip'

type Props = {
  trip: TripWithPlaces
  isEditOpen: boolean
  isDeleteOpen: boolean
  editingTripPlace: TripPlaceWithPlace | null
  isUpdatingPlace: boolean
  isDeleting: boolean
  onCloseEdit: () => void
  onCloseDelete: () => void
  onCloseEditingPlace: () => void
  onSaveTrip: (data: TripInput) => Promise<void>
  onSaveTripPlace: (data: TripPlaceUpdateInput) => Promise<void>
  onConfirmDelete: () => Promise<void>
}

function TripDetailModals({
  trip,
  isEditOpen,
  isDeleteOpen,
  editingTripPlace,
  isUpdatingPlace,
  isDeleting,
  onCloseEdit,
  onCloseDelete,
  onCloseEditingPlace,
  onSaveTrip,
  onSaveTripPlace,
  onConfirmDelete,
}: Props) {
  return (
    <>
      <TripFormModal
        isOpen={isEditOpen}
        initialData={{
          name: trip.name,
          description: trip.description,
          start_date: trip.start_date,
          end_date: trip.end_date,
        }}
        onClose={onCloseEdit}
        onSave={onSaveTrip}
      />
      <TripPlaceEditModal
        isOpen={!!editingTripPlace}
        initialData={
          editingTripPlace
            ? { planned_date: editingTripPlace.planned_date, notes: editingTripPlace.notes }
            : { planned_date: null, notes: null }
        }
        placeName={editingTripPlace?.place.name ?? ''}
        tripStartDate={trip.start_date}
        tripEndDate={trip.end_date}
        isSaving={isUpdatingPlace}
        onSave={onSaveTripPlace}
        onClose={onCloseEditingPlace}
      />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Trip löschen"
        message={`Möchtest du "${trip.name}" wirklich löschen? Die einzelnen Orte bleiben erhalten, nur der Trip wird entfernt.`}
        confirmLabel="Löschen"
        isProcessing={isDeleting}
        onConfirm={onConfirmDelete}
        onCancel={onCloseDelete}
      />
    </>
  )
}

export default TripDetailModals
