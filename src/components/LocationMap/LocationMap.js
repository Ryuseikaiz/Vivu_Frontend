import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './LocationMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORY_OPTIONS = [
  { value: 'restaurant', label: 'Nhà hàng', emoji: '🍽️' },
  { value: 'cafe', label: 'Quán cà phê', emoji: '☕' },
  { value: 'lodging', label: 'Khách sạn', emoji: '🏨' },
  { value: 'tourist_attraction', label: 'Điểm tham quan', emoji: '🎯' }
];

const MAX_RESULTS = 12;

const formatRating = (rating) => {
  const numeric = Number(rating);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : null;
};

const formatPlaceType = (type) => {
  if (!type) return '';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const LocationMap = ({ onLocationSelect }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const buildMapsUrl = useCallback((place) => {
    if (!place) {
      return 'https://www.google.com/maps';
    }

    if (place.place_id) {
      return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
    }

    const lat = place?.geometry?.location?.lat;
    const lng = place?.geometry?.location?.lng;

    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    if (place.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    }

    return 'https://www.google.com/maps';
  }, []);

  const fetchNearbyPlaces = useCallback(async (location, category, retryCount = 0) => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/location/nearby', {
        location,
        category,
        radius: 2000
      });
      setNearbyPlaces(response.data.places || []);
    } catch (fetchError) {
      console.error('Error fetching nearby places:', fetchError);
      
      // Handle specific error cases
      if (fetchError.response?.status === 429) {
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          setError({ type: 'data', message: `Quá nhiều yêu cầu. Đang thử lại sau ${delay/1000}s...` });
          
          setTimeout(() => {
            fetchNearbyPlaces(location, category, retryCount + 1);
          }, delay);
          return;
        } else {
          setError({ 
            type: 'data', 
            message: 'Máy chủ đang quá tải. Vui lòng thử lại sau vài phút.' 
          });
        }
      } else if (fetchError.response?.status >= 500) {
        setError({ 
          type: 'data', 
          message: 'Lỗi máy chủ. Vui lòng thử lại sau.' 
        });
      } else if (fetchError.code === 'NETWORK_ERROR' || !fetchError.response) {
        setError({ 
          type: 'data', 
          message: 'Không có kết nối mạng. Vui lòng kiểm tra internet.' 
        });
      } else {
        setError({ 
          type: 'data', 
          message: 'Không thể tải danh sách địa điểm. Vui lòng thử lại sau.' 
        });
      }
    } finally {
      if (retryCount === 0) { // Only set loading false on initial request
        setLoading(false);
      }
    }
  }, []);

  // Get user's current location with accuracy retry
  const getCurrentLocation = useCallback((retryCount = 0) => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({ type: 'geolocation', message: 'Trình duyệt không hỗ trợ định vị.' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const accuracy = Math.round(position.coords.accuracy);

        // Log accuracy for debugging
        console.log('📍 Vị trí hiện tại (lần thử ' + (retryCount + 1) + '):', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: accuracy + 'm',
          heading: position.coords.heading,
          speed: position.coords.speed
        });

        // If accuracy is very poor (>500m) and we haven't retried yet, try again
        if (accuracy > 500 && retryCount < 2) {
          console.log('⚠️ Độ chính xác kém, đang thử lại...');
          setError({
            type: 'info',
            message: `Độ chính xác hiện tại: ±${accuracy}m. Đang cải thiện độ chính xác...`
          });

          setTimeout(() => {
            getCurrentLocation(retryCount + 1);
          }, 2000);
          return;
        }

        setLocationAccuracy(accuracy);

        // Show warning if accuracy is still poor
        if (accuracy > 200) {
          setError({
            type: 'warning',
            message: `Độ chính xác không cao (±${accuracy}m). Kết quả có thể không chính xác. Hãy di chuyển ra ngoài trời hoặc bật GPS.`
          });
        }

        setUserLocation(location);
        fetchNearbyPlaces(location, selectedCategory);
        setLoading(false);
      },
      (geoError) => {
        let errorMessage = 'Không thể lấy vị trí. ';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage += 'Bạn cần cho phép truy cập vị trí.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage += 'Tín hiệu định vị không ổn định. Hãy di chuyển ra ngoài trời.';
            break;
          case geoError.TIMEOUT:
            errorMessage += 'Yêu cầu định vị quá thời gian cho phép. Hãy thử lại.';
            break;
          default:
            errorMessage += 'Đã xảy ra lỗi không xác định.';
            break;
        }
        setError({ type: 'geolocation', message: errorMessage });
        console.error('Geolocation error:', geoError);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,      // Sử dụng GPS thay vì WiFi/Cell Tower
        timeout: 20000,                 // Tăng timeout lên 20s để GPS có thời gian định vị chính xác hơn
        maximumAge: 30000               // Cho phép cache 30s để GPS có thời gian ổn định
      }
    );
  }, [fetchNearbyPlaces, selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (userLocation) {
      fetchNearbyPlaces(userLocation, category);
    }
  };

  const handleOpenInMaps = (place) => {
    const url = buildMapsUrl(place);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSelectPlace = (event, place) => {
    event.stopPropagation();
    handleOpenInMaps(place);
    if (onLocationSelect) {
      onLocationSelect(place);
    }
  };

  const handlePlaceKeyDown = (event, place) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenInMaps(place);
    }
  };

  const placesToDisplay = useMemo(
    () => nearbyPlaces.slice(0, MAX_RESULTS),
    [nearbyPlaces]
  );

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const dismissError = useCallback(() => setError(null), []);


  // Create custom icons
  const createUserLocationIcon = () => {
    return L.divIcon({
      html: `<div style="
        background: #4285F4;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      className: 'custom-user-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const createPlaceIcon = (type) => {
    const icons = {
      restaurant: '🍽️',
      cafe: '☕',
      lodging: '🏨',
      tourist_attraction: '🎯',
      default: '📍'
    };

    const emoji = icons[type] || icons.default;
    
    return L.divIcon({
      html: `<div style="
        background: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid #333;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${emoji}</div>`,
      className: 'custom-place-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className="location-map-container">
      <section className="location-hero card">
        <div className="location-hero__content">
          <span className="location-hero__eyebrow">Khám phá ngay</span>
          <h1 className="location-hero__title">Địa điểm nổi bật quanh bạn</h1>
          <p className="location-hero__description">
            Sử dụng dữ liệu Google Maps để gợi ý những điểm ăn uống, giải trí và lưu trú nổi bật.
            Chọn danh mục bạn quan tâm và bắt đầu hành trình khám phá chỉ với một chạm.
          </p>
        </div>

        <div className="location-hero__actions">
          <div className="category-chips">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`category-chip ${selectedCategory === option.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(option.value)}
              >
                <span className="chip-emoji" aria-hidden="true">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="location-button"
            onClick={getCurrentLocation}
            disabled={loading}
          >
            {loading ? 'Đang xác định vị trí...' : '📍 Lấy vị trí hiện tại'}
          </button>

          {error && (
            <div className={`error-message error-message--${error.type || 'general'}`} role="alert">
              <span>{error.message || error}</span>
              <button type="button" className="error-dismiss" onClick={dismissError}>
                Đã hiểu
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="location-body">
        <div className="map-card card">
          <div className="map-card__header">
            <div>
              <h2>Bản đồ tương tác</h2>
              <p>Phóng to, thu nhỏ và chạm vào từng điểm để xem chi tiết nhanh.</p>
            </div>
            {userLocation && (
              <div className="map-status-group">
                <span className="map-status">Đang hiển thị trong bán kính 2km</span>
                {locationAccuracy && (
                  <span className={`accuracy-badge ${locationAccuracy < 50 ? 'good' : locationAccuracy < 200 ? 'medium' : 'poor'}`}>
                    📍 Độ chính xác: ±{locationAccuracy}m
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="map-wrapper">
            {userLocation ? (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                className="map-canvas"
              >
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                />

                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createUserLocationIcon()}
                >
                  <Popup>
                    <strong>📍 Vị trí của bạn</strong>
                  </Popup>
                </Marker>

                {nearbyPlaces.map((place) => (
                  <Marker
                    key={place.place_id || `${place.geometry.location.lat}-${place.geometry.location.lng}`}
                    position={[place.geometry.location.lat, place.geometry.location.lng]}
                    icon={createPlaceIcon(place.types?.[0])}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h4>{place.name}</h4>
                        <p>{place.vicinity}</p>
                        <button
                          type="button"
                          className="popup-link"
                          onClick={() => handleOpenInMaps(place)}
                        >
                          Mở Google Maps ↗
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="map-loading">
                {loading ? 'Đang xác định vị trí của bạn...' : 'Nhấn "Lấy vị trí hiện tại" để bắt đầu khám phá'}
              </div>
            )}
          </div>
        </div>

        <div className="places-card card">
          <div className="places-header">
            <div>
              <h2>Danh sách đề xuất</h2>
              <p>Chạm để xem đường đi trên Google Maps hoặc chọn để dùng cho hành trình.</p>
            </div>
            <span className="places-count">{placesToDisplay.length} địa điểm</span>
          </div>

          <div className="places-list">
            {placesToDisplay.length === 0 && !loading && (
              <div className="empty-state">
                <h3>Chưa có dữ liệu</h3>
                <p>Hãy thử chuyển sang danh mục khác hoặc lấy lại vị trí của bạn.</p>
              </div>
            )}

            {loading && (
              <div className="loading-state">Đang tải danh sách địa điểm...</div>
            )}

            {placesToDisplay.map((place) => {
              const displayRating = formatRating(place.rating);
              const primaryType = formatPlaceType(place.types?.[0]);

              // Generate a unique placeholder image based on place name
              const getPlaceholderImage = (placeName, category) => {
                const categoryImages = {
                  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                  cafe: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop',
                  lodging: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
                  tourist_attraction: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
                };
                return categoryImages[category] || categoryImages.tourist_attraction;
              };

              return (
                <div
                  key={place.place_id || `${place.geometry.location.lat}-${place.geometry.location.lng}`}
                  className="place-card"
                  role="link"
                  tabIndex={0}
                  onClick={() => handleOpenInMaps(place)}
                  onKeyDown={(event) => handlePlaceKeyDown(event, place)}
                >
                  {place.photos && place.photos.length > 0 ? (
                    <div className="place-image">
                      <img
                        src={`/api/location/photo/${place.photos[0].photo_reference}?maxwidth=300`}
                        alt={place.name}
                        loading="lazy"
                        onError={(event) => {
                          // If photo fails to load, use placeholder
                          event.currentTarget.src = getPlaceholderImage(place.name, place.types?.[0]);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="place-image">
                      <img
                        src={getPlaceholderImage(place.name, place.types?.[0])}
                        alt={place.name}
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="place-meta">
                    <div className="place-heading">
                      <h3>{place.name}</h3>
                      {displayRating && (
                        <span className="badge rating">⭐ {displayRating}</span>
                      )}
                    </div>
                    <p className="place-address">{place.vicinity || 'Đang cập nhật địa chỉ'}</p>
                    <div className="place-tags">
                      {place.price_level && (
                        <span className="badge price">{Array(place.price_level).fill('💰').join('')}</span>
                      )}
                      {primaryType && (
                        <span className="badge type">{primaryType}</span>
                      )}
                    </div>
                  </div>

                  <div className="place-actions">
                    <span className="open-maps">Mở Google Maps ↗</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};



export default LocationMap;