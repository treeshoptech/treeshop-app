"use client";

import { useEffect, useRef, useState } from 'react';
import { TextField, CircularProgress, InputAdornment } from '@mui/material';
import { useLoadScript } from '@react-google-maps/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const libraries: ('places')[] = ['places'];

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, details?: google.maps.places.PlaceResult) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  label = "Address",
  placeholder = "Start typing address...",
  error,
  helperText,
  fullWidth = true,
  required = false
}: AddressAutocompleteProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      types: ['address'],
    });

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.formatted_address) {
        setInputValue(place.formatted_address);
        onChange(place.formatted_address, place);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Also update parent with raw input value
    onChange(newValue);
  };

  if (!isLoaded) {
    return (
      <TextField
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Loading..."
        fullWidth={fullWidth}
        disabled
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
      />
    );
  }

  return (
    <TextField
      inputRef={inputRef}
      label={label}
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      required={required}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LocationOnIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}
