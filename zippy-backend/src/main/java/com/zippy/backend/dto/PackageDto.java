package com.zippy.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PackageDto {

    @NotNull(message = "Package weight in grams is required")
    @Min(value = 1, message = "Weight must be greater than 0")
    private Integer weightGrams;

    private Integer lengthCm;
    private Integer widthCm;
    private Integer heightCm;

    public PackageDto() {
    }

    public PackageDto(Integer weightGrams, Integer lengthCm, Integer widthCm, Integer heightCm) {
        this.weightGrams = weightGrams;
        this.lengthCm = lengthCm;
        this.widthCm = widthCm;
        this.heightCm = heightCm;
    }

    public Integer getWeightGrams() {
        return weightGrams;
    }

    public void setWeightGrams(Integer weightGrams) {
        this.weightGrams = weightGrams;
    }

    public Integer getLengthCm() {
        return lengthCm;
    }

    public void setLengthCm(Integer lengthCm) {
        this.lengthCm = lengthCm;
    }

    public Integer getWidthCm() {
        return widthCm;
    }

    public void setWidthCm(Integer widthCm) {
        this.widthCm = widthCm;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
    }
}
