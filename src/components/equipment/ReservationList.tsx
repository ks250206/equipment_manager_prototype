"use client";

import { useState } from "react";
import { Reservation } from "@/domain/models/Reservation/Reservation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ReservationListProps {
  reservations: Reservation[];
}

export function ReservationList({ reservations }: ReservationListProps) {
  const [upcomingPage, setUpcomingPage] = useState<number>(1);
  const [pastPage, setPastPage] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const itemsPerPage = 10;

  const now = new Date();
  const allUpcomingReservations = reservations
    .filter((r) => new Date(r.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  const allPastReservations = reservations
    .filter((r) => new Date(r.endTime) < now)
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

  // Pagination calculations for upcoming reservations
  const upcomingTotalPages = Math.ceil(
    allUpcomingReservations.length / itemsPerPage,
  );
  const upcomingStartIndex = (upcomingPage - 1) * itemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + itemsPerPage;
  const upcomingReservations = allUpcomingReservations.slice(
    upcomingStartIndex,
    upcomingEndIndex,
  );

  // Pagination calculations for past reservations
  const pastTotalPages = Math.ceil(allPastReservations.length / itemsPerPage);
  const pastStartIndex = (pastPage - 1) * itemsPerPage;
  const pastEndIndex = pastStartIndex + itemsPerPage;
  const pastReservations = allPastReservations.slice(
    pastStartIndex,
    pastEndIndex,
  );

  return (
    <Card>
      <CardHeader>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <CardTitle>Reservations</CardTitle>
          <span className="text-sm text-gray-500">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Upcoming Reservations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Upcoming Reservations{" "}
              {allUpcomingReservations.length > 0 &&
                `(${allUpcomingReservations.length})`}
            </h3>
            {allUpcomingReservations.length === 0 ? (
              <p className="text-gray-500">No reservations</p>
            ) : (
              <>
                <div className="space-y-2">
                  {upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {format(
                              new Date(reservation.startTime),
                              "yyyy/MM/dd HH:mm",
                              {
                                locale: ja,
                              },
                            )}{" "}
                            -{" "}
                            {format(new Date(reservation.endTime), "HH:mm", {
                              locale: ja,
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Booker: {reservation.booker?.name || "Unknown"}
                          </p>
                          {reservation.comment && (
                            <p className="text-sm text-gray-500 mt-1">
                              {reservation.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls for Upcoming Reservations */}
                {upcomingTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-700">
                      {upcomingStartIndex + 1} -{" "}
                      {Math.min(
                        upcomingEndIndex,
                        allUpcomingReservations.length,
                      )}{" "}
                      of {allUpcomingReservations.length} items
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setUpcomingPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={upcomingPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm text-gray-700">
                        Page {upcomingPage} / {upcomingTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setUpcomingPage((prev) =>
                            Math.min(upcomingTotalPages, prev + 1),
                          )
                        }
                        disabled={upcomingPage === upcomingTotalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Past Reservations */}
          {allPastReservations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Past Reservations ({allPastReservations.length})
              </h3>
              <div className="space-y-2">
                {pastReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-600">
                          {format(
                            new Date(reservation.startTime),
                            "yyyy/MM/dd HH:mm",
                            {
                              locale: ja,
                            },
                          )}{" "}
                          -{" "}
                          {format(new Date(reservation.endTime), "HH:mm", {
                            locale: ja,
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Booker: {reservation.booker?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls for Past Reservations */}
              {pastTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    {pastStartIndex + 1} -{" "}
                    {Math.min(pastEndIndex, allPastReservations.length)} of{" "}
                    {allPastReservations.length} items
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPastPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={pastPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-gray-700">
                      Page {pastPage} / {pastTotalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPastPage((prev) =>
                          Math.min(pastTotalPages, prev + 1),
                        )
                      }
                      disabled={pastPage === pastTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
