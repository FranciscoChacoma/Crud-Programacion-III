package com.example.backend.dto;

import java.util.List;

public record EmailReport(int sent, List<String> withoutEmail, List<String> failed) {}
