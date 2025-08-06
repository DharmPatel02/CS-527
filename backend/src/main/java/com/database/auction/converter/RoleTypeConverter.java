package com.database.auction.converter;

import com.database.auction.enums.RoleType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RoleTypeConverter implements AttributeConverter<RoleType, String> {

    @Override
    public String convertToDatabaseColumn(RoleType roleType) {
        if (roleType == null) {
            return null;
        }
        return roleType.name();
    }

    @Override
    public RoleType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return RoleType.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role type: " + dbData);
        }
    }
} 