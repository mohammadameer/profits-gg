import { Button, Page } from "@profits-gg/ui";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useLoadScript, DrawingManager } from "@react-google-maps/api";
import useDebounce from "@profits-gg/lib/hooks/useDebounce";
import { api } from "src/utils/api";
import GoogleDataItem from "src/components/GoogleDataItem";
import type { List } from "@prisma/client";
import { useSession } from "next-auth/react";
import { LoginModalContext } from "src/components/Layout";
import clsx from "clsx";
import path from "path";
import fullPlaces from "./places";
export default function GoogleMaps() {
  const { status: sessionStatus } = useSession();

  const { setLoginOpen } = useContext(LoginModalContext);

  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  const libraries = useMemo(() => ["places", "drawing"], []);

  const [mapReady, setMapReady] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 24.682657,
    lng: 46.690707,
  });

  const { data: lists } = api.list.list.useQuery();

  const debouncedMapCenter = useDebounce(mapCenter, 500);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      streetViewControl: false,
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: true,
      tilt: 0,
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
    libraries: libraries as any,
  });

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
    getPlaces(map);
  };

  const getPlaces = (onLoadMap: google.maps.Map) => {
    const placeApi = new google.maps.places.PlacesService(onLoadMap || (map as google.maps.Map));

    const request = {
      location: debouncedMapCenter,
      radius: 500,
    };

    // placeApi.nearbySearch(request, (results, status) => {
    //   if (status === google.maps.places.PlacesServiceStatus.OK) {
    //     setPlaces(results as google.maps.places.PlaceResult[]);
    //   }
    // });
  };

  const { lat, lng } = debouncedMapCenter;

  useEffect(() => {
    if (map) {
      getPlaces(map);
    }
  }, [lat, lng]);

  return (
    <Page title="🗺️ خرائط قوقل">
      <div className="grid w-full grid-cols-12 gap-4">
        <div
          className={clsx(
            "col-span-12 h-[450px] overflow-hidden rounded-md p-4 md:h-[65vh]",
            fullScreen ? "fixed left-0 top-0 h-full w-full" : ""
          )}>
          {isLoaded ? (
            <GoogleMap
              options={mapOptions}
              zoom={10}
              center={debouncedMapCenter}
              mapContainerStyle={{
                width: "100%",
                height: "100%",
                ...(fullScreen ? { position: "fixed", top: 0, left: 0 } : { position: "relative" }),
              }}
              mapTypeId={google.maps.MapTypeId.ROADMAP}
              onCenterChanged={() => {
                if (map) {
                  const center = map.getCenter()?.toJSON() as google.maps.LatLngLiteral;
                  if (center?.lat !== mapCenter.lat && center?.lng !== mapCenter.lng) {
                    setMapCenter(center);
                  }
                }
              }}
              onLoad={onMapLoad}>
              <DrawingManager
                onLoad={(drawingManager) => {
                  drawingManagerRef.current = drawingManager;
                }}
                options={{
                  drawingControl: true,
                  drawingControlOptions: {
                    position: google.maps.ControlPosition.BOTTOM_CENTER,
                    drawingModes: [google.maps.drawing.OverlayType.RECTANGLE],
                  },
                  rectangleOptions: {
                    fillColor: "#ff0000",
                    fillOpacity: 0.2,
                    strokeWeight: 2,
                    clickable: true,
                    editable: true,
                    draggable: true,
                    zIndex: 1,
                  },
                }}
              />

              <div
                className={clsx(
                  "absolute top-0 flex w-full gap-4 overflow-scroll rounded-md p-2 lg:left-2 lg:h-full lg:w-4/12 lg:flex-col",
                  fullScreen ? "pt-28" : ""
                )}>
                {places.map((place) => {
                  if (!place.business_status) return null;

                  return (
                    <GoogleDataItem
                      key={place.place_id}
                      lists={lists as List[]}
                      place={place}
                      selectedPlace={selectedPlace}
                      setSelectedPlace={setSelectedPlace}
                      sessionStatus={sessionStatus}
                      setLoginOpen={setLoginOpen}
                    />
                  );
                })}
              </div>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  text={fullScreen ? "عودة للحجم الرئيسي" : "عرض الشاشة كاملة"}
                  onClick={() => setFullScreen(!fullScreen)}
                />
                <Button
                  text="بحث 🔍"
                  onClick={() => {
                    console.log("test");
                    // draw a rectangle on the map
                    if (drawingManagerRef.current) {
                      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                    }

                    // get the bounds of the rectangle
                    const bounds = map?.getBounds();

                    // fill the bounds with rectangles that are 1/24 of the bounds
                    if (bounds) {
                      const ne = bounds.getNorthEast();
                      const sw = bounds.getSouthWest();

                      const latDiff = ne.lat() - sw.lat();
                      const lngDiff = ne.lng() - sw.lng();

                      const latStep = latDiff / 24;
                      const lngStep = lngDiff / 24;

                      const rectangles = [];
                      const places = [];

                      const placesApi = new google.maps.places.PlacesService(map as google.maps.Map);

                      for (let i = 0; i < 24; i++) {
                        for (let j = 0; j < 24; j++) {
                          // for every square get the places, get places

                          placesApi.textSearch(
                            {
                              query: "فندق",
                              bounds: {
                                north: ne.lat() - i * latStep,
                                south: ne.lat() - (i + 1) * latStep,
                                east: ne.lng() - j * lngStep,
                                west: ne.lng() - (j + 1) * lngStep,
                              },
                            },
                            (results, status, pagination) => {
                              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                                for (const place of results) {
                                  places.push(place);
                                }

                                console.log("#", i, j, "places", places);

                                // get all the places

                                if (pagination?.hasNextPage) {
                                  pagination.nextPage();
                                }
                              }
                            }
                          );

                          const rectangle = new google.maps.Rectangle({
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FF0000",
                            fillOpacity: 0.35,
                            map,
                            bounds: {
                              north: ne.lat() - i * latStep,
                              south: ne.lat() - (i + 1) * latStep,
                              east: ne.lng() - j * lngStep,
                              west: ne.lng() - (j + 1) * lngStep,
                            },
                          });

                          rectangles.push(rectangle);
                        }
                      }

                      console.log(rectangles);
                      console.log("places", places);
                    }
                  }}
                />
                <Button
                  text="طلب رقم الأماكن"
                  onClick={async () => {
                    const filteredPlaces = [];

                    const placesApi = new google.maps.places.PlacesService(map as google.maps.Map);
                    const uniquePlaceIds = new Set();

                    await Promise.all(
                      fullPlaces.map(async (place) => {
                        if (uniquePlaceIds.has(place.place_id)) {
                          return;
                        }

                        uniquePlaceIds.add(place.place_id);

                        try {
                          const challetDetails = await new Promise((resolve) => {
                            placesApi.getDetails(
                              {
                                placeId: place.place_id,
                                fields: ["formatted_phone_number"],
                              },
                              (place, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                                  resolve(place);
                                } else {
                                  resolve(null);
                                }
                              }
                            );
                          });

                          filteredPlaces.push({
                            ...place,
                            phone: challetDetails?.formatted_phone_number || undefined,
                          });
                          console.log("filteredPlaces", filteredPlaces);
                        } catch (error) {
                          console.error("An error occurred:", error);
                        }
                      })
                    );

                    console.log("filteredPlaces", filteredPlaces);
                  }}
                />
              </div>
            </GoogleMap>
          ) : null}
        </div>
      </div>
    </Page>
  );
}