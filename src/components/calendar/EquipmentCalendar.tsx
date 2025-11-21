"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useActionState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createReservationAction,
  updateReservationAction,
} from "@/application/actions/reservation";
import { EQUIPMENT_COLORS, getColorIndexFromEquipmentId } from "@/lib/utils";

const locales = {
  "en-US": enUS,
};

// Custom formats for 24-hour time display
const formats = {
  timeGutterFormat: "HH:mm",
  eventTimeRangeFormat: (
    { start, end }: { start: Date; end: Date },
    culture: string | undefined,
    localizer: { format: (date: Date, format: string, culture?: string) => string },
  ) =>
    `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(end, "HH:mm", culture)}`,
  agendaTimeRangeFormat: (
    { start, end }: { start: Date; end: Date },
    culture: string | undefined,
    localizer: { format: (date: Date, format: string, culture?: string) => string },
  ) =>
    `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(end, "HH:mm", culture)}`,
  dayHeaderFormat: "MMMM dd, yyyy",
  dayRangeHeaderFormat: (
    { start, end }: { start: Date; end: Date },
    culture: string | undefined,
    localizer: { format: (date: Date, format: string, culture?: string) => string },
  ) =>
    `${localizer.format(start, "MMM dd", culture)} - ${localizer.format(end, "MMM dd", culture)}`,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Event = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown;
  style?: {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };
};

type Props = {
  reservations: Array<{
    id: string;
    equipmentId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    title?: string | null;
  }>;
  equipments: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
  timezone: string;
  currentUser: {
    id: string;
    email: string;
    name: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    department: string | null;
    role: string;
  } | null;
  checkedEquipmentIds?: Set<string>;
};

const initialState = {
  error: "",
  success: false,
};

// Helper function to convert Date to local datetime-local string
// Converts UTC date to system timezone for datetime-local input
function toLocalDateTimeString(date: Date, timezone: string): string {
  // Convert UTC date to the system timezone
  const zonedDate = toZonedTime(date, timezone);
  const year = zonedDate.getFullYear();
  const month = String(zonedDate.getMonth() + 1).padStart(2, "0");
  const day = String(zonedDate.getDate()).padStart(2, "0");
  const hours = String(zonedDate.getHours()).padStart(2, "0");
  const minutes = String(zonedDate.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EquipmentCalendar({
  reservations,
  equipments,
  timezone,
  currentUser,
  checkedEquipmentIds,
}: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [state, formAction, isPending] = useActionState(
    createReservationAction,
    initialState,
  );
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateReservationAction,
    initialState,
  );

  useEffect(() => {
    const mappedEvents = reservations.map((r) => {
      // Shift dates to the target timezone so they appear correctly in the calendar
      // toZonedTime returns a Date object where the getters return the components of the zoned time
      const startShifted = toZonedTime(new Date(r.startTime), timezone);
      const endShifted = toZonedTime(new Date(r.endTime), timezone);

      // Get equipment color dynamically based on equipmentId
      const colorIndex = getColorIndexFromEquipmentId(r.equipmentId);
      const backgroundColor =
        EQUIPMENT_COLORS[colorIndex] || EQUIPMENT_COLORS[0];
      // Border color is the same as background
      const borderColor = backgroundColor;

      return {
        title: `${r.equipment?.name || "Unknown Equipment"} - ${r.booker?.name || "Unknown User"}`,
        start: startShifted,
        end: endShifted,
        style: {
          backgroundColor,
          borderColor,
          color: "#333333", // Dark text for readability
          fontSize: "0.75rem", // Smaller font size
        },
        resource: {
          reservationId: r.id,
          equipmentId: r.equipmentId,
          equipmentName: r.equipment?.name || "Unknown Equipment",
          bookerName: r.booker?.name || "Unknown User",
          userId: r.userId,
          comment: r.comment,
          startTime: r.startTime, // Original UTC time
          endTime: r.endTime, // Original UTC time
        },
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents(mappedEvents);
  }, [reservations, timezone, equipments]);

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreateModalOpen(false);
      // Reset state or show success message if needed
    }
  }, [state?.success]);

  useEffect(() => {
    if (updateState?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditMode(false);
      setIsDetailModalOpen(false);
      // Reset state or show success message if needed
    }
  }, [updateState?.success]);

  // Filter equipments based on checkedEquipmentIds
  const filteredEquipments = useMemo(() => {
    return equipments.filter(
      (eq) => !checkedEquipmentIds || checkedEquipmentIds.has(eq.id),
    );
  }, [equipments, checkedEquipmentIds]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    // Set initial equipment to the first one in the filtered list
    if (filteredEquipments.length > 0) {
      setSelectedEquipmentId(filteredEquipments[0].id);
    } else {
      setSelectedEquipmentId("");
    }
    setIsCreateModalOpen(true);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditMode(false);
    setIsDetailModalOpen(true);
  };

  // Check if current user can edit the selected reservation
  const canEditReservation = (reservation: { userId?: string }): boolean => {
    if (!currentUser) return false;
    // Check if user is the owner
    if (reservation?.userId === currentUser.id) return true;
    // Check if user is admin or editor
    if (currentUser.role === "ADMIN" || currentUser.role === "EDITOR")
      return true;
    return false;
  };

  // Custom event style getter
  const eventStyleGetter = (event: Event) => {
    return {
      style: event.style || {
        backgroundColor: EQUIPMENT_COLORS[0],
        borderColor: EQUIPMENT_COLORS[0],
        color: "#333333",
        fontSize: "0.75rem", // Smaller font size
      },
    };
  };

  return (
    <div className="h-[calc(100vh-250px)] min-h-[1000px] bg-white p-4 rounded shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "day", "agenda"]}
        defaultView="week"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        formats={formats}
        eventPropGetter={eventStyleGetter}
      />

      {/* Create Reservation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
          </DialogHeader>
          <form action={formAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="comment">Comment</Label>
                <Input
                  id="comment"
                  name="comment"
                  placeholder="Meeting details"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Select
                  name="equipmentId"
                  value={selectedEquipmentId}
                  onValueChange={setSelectedEquipmentId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEquipments.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="equipmentId"
                  value={selectedEquipmentId}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    defaultValue={
                      selectedSlot
                        ? toLocalDateTimeString(selectedSlot.start, timezone)
                        : ""
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    defaultValue={
                      selectedSlot
                        ? toLocalDateTimeString(selectedSlot.end, timezone)
                        : ""
                    }
                    required
                  />
                </div>
              </div>
              {state?.error && (
                <div className="text-red-500 text-sm">{state.error}</div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reservation Detail Modal */}
      <Dialog
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setIsEditMode(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Reservation" : "Reservation Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent?.resource && (
            <>
              {isEditMode ? (
                <form action={updateFormAction}>
                  <input
                    type="hidden"
                    name="id"
                    value={selectedEvent.resource.reservationId}
                  />
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-comment">Comment</Label>
                      <Textarea
                        id="edit-comment"
                        name="comment"
                        defaultValue={selectedEvent.resource.comment || ""}
                        placeholder="Meeting details"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-equipment">Equipment</Label>
                      <Select
                        name="equipmentId"
                        defaultValue={selectedEvent.resource.equipmentId}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipments.map((eq) => (
                            <SelectItem key={eq.id} value={eq.id}>
                              {eq.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-startTime">Start Time</Label>
                        <Input
                          id="edit-startTime"
                          name="startTime"
                          type="datetime-local"
                          defaultValue={toLocalDateTimeString(
                            new Date(selectedEvent.resource.startTime),
                            timezone,
                          )}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-endTime">End Time</Label>
                        <Input
                          id="edit-endTime"
                          name="endTime"
                          type="datetime-local"
                          defaultValue={toLocalDateTimeString(
                            new Date(selectedEvent.resource.endTime),
                            timezone,
                          )}
                          required
                        />
                      </div>
                    </div>
                    {updateState?.error && (
                      <div className="text-red-500 text-sm">
                        {updateState.error}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditMode(false)}
                      disabled={isUpdatePending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdatePending}>
                      {isUpdatePending ? "Updating..." : "Update"}
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label className="font-semibold">Equipment</Label>
                      <div className="text-sm">
                        {selectedEvent.resource.equipmentName}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-semibold">Booked by</Label>
                      <div className="text-sm">
                        {selectedEvent.resource.bookerName}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="font-semibold">Start Time</Label>
                        <div className="text-sm">
                          {formatTz(
                            new Date(selectedEvent.resource.startTime),
                            "yyyy-MM-dd HH:mm",
                            { timeZone: timezone },
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-semibold">End Time</Label>
                        <div className="text-sm">
                          {formatTz(
                            new Date(selectedEvent.resource.endTime),
                            "yyyy-MM-dd HH:mm",
                            { timeZone: timezone },
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedEvent.resource.comment && (
                      <div className="grid gap-2">
                        <Label className="font-semibold">Comment</Label>
                        <div className="text-sm">
                          {selectedEvent.resource.comment}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    {canEditReservation(selectedEvent.resource) && (
                      <Button
                        variant="default"
                        onClick={() => setIsEditMode(true)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailModalOpen(false)}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
