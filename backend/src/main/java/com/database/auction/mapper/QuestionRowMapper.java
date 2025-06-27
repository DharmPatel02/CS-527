package com.database.auction.mapper;

import com.database.auction.dto.QuestionDTO;
import com.database.auction.entity.AuctionQuestion;
import java.util.List;
import java.util.stream.Collectors;

public class QuestionRowMapper {

    /**
     * Map a single AuctionQuestion entity to its DTO representation.
     */
    public static QuestionDTO toQuestionDto(AuctionQuestion question) {
        if (question == null) {
            return null;
        }
        QuestionDTO dto = new QuestionDTO();
        dto.setQuestionId(question.getQuestionId());
        // Assuming AuctionQuestion has a getAuctionItem() returning the parent entity
        //dto.setAuctionId(question.getAuctionItems().getauction_id());
        dto.setQuestion(question.getQuestion());
        dto.setAnswer(question.getAnswer());
        return dto;
    }

    /**
     * Map a list of AuctionQuestion entities to a list of DTOs.
     */
    public static List<QuestionDTO> toQuestionDtoList(List<AuctionQuestion> questions) {
        return questions.stream()
                .map(QuestionRowMapper::toQuestionDto)
                .collect(Collectors.toList());
    }
}
