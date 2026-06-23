import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateEvent } from "@/lib/event-actions";
import Link from "next/link";

type Props = {
  params: Promise<{ eventId: string }>;
};

function toDateTimeLocal(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
}

export default async function Page({ params }: Props) {
  const { eventId } = await params;

  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Event not found</h2>
        <p>
          <Link href="/events">Back to events</Link>
        </p>
      </div>
    );
  }

  if (event.userId !== session?.user?.id) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Not authorized</h2>
        <p>You are not authorized to edit this event.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Event</h1>
      <form action={updateEvent} className="space-y-4">
        <input type="hidden" name="eventId" value={event.id} />
        <div>
          <label className="block mb-1">Title</label>
          <input
            name="title"
            defaultValue={event.title}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={event.description}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Date</label>
          <input
            type="datetime-local"
            name="date"
            defaultValue={toDateTimeLocal(new Date(event.date))}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Location</label>
          <input
            name="location"
            defaultValue={event.location}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Max Attendees</label>
          <input
            name="maxAttendees"
            type="number"
            defaultValue={event.maxAttendees ?? undefined}
            className="input-field w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            defaultChecked={event.isPublic}
          />
          <label htmlFor="isPublic">Public event</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
          <Link href={`/events/${event.id}`} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
