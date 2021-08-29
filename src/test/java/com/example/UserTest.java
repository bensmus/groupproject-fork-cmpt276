package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {
    static User u;

    @BeforeAll
    static void setUp() {
        u = new User();
        u.setUname("Sam");
        u.setPass("g5e9a9d2cc2jc967a453909397z07e25");

        u.setHighscore(0);
        u.setCoins(0);
        u.setPlace(0);

        u.setColor("green");
        u.setGlasses("noglasses");
    }

    @Test
    public void userLogin() {
        assertEquals("Sam", u.getUname());
        u.setUname("steve");
        assertEquals("steve", u.getUname());
        assertEquals("g5e9a9d2cc2jc967a453909397z07e25", u.getPass());
        u.setPass("95999992999999679453909397907925");
        assertEquals("95999992999999679453909397907925", u.getPass());
        u.setPass("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        assertEquals("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", u.getPass());
    }

    @Test
    public void userScore() {
        assertEquals(0, u.getCoins());
        u.setCoins(2147483647);
        assertEquals(2147483647, u.getCoins());
        u.setCoins(-2147483648);
        assertEquals(-2147483648, u.getCoins());

        assertEquals(0, u.getHighscore());
        u.setHighscore(2147483647);
        assertEquals(2147483647, u.getHighscore());
        u.setHighscore(-2147483648);
        assertEquals(-2147483648, u.getHighscore());

        assertEquals(0, u.getPlace());
        u.setPlace(2147483647);
        assertEquals(2147483647, u.getPlace());
        u.setPlace(-2147483648);
        assertEquals(-2147483648, u.getPlace());
    }

    @Test
    public void userCosmetic() {
        assertEquals("green", u.getColor());
        u.setColor("blue");
        assertEquals("blue", u.getColor());

        assertEquals("noglasses", u.getGlasses());
        u.setGlasses("glasses");
        assertEquals("glasses", u.getGlasses());
    }

	@Test 
	public void userGetUnlockedString() {
		String[] unlocked = {"green", "glasses"};
		u.setUnlocked(unlocked);
		String unlockedString = u.getUnlockedString();
		assertEquals("{\"green\",\"glasses\"}", unlockedString);
	}
}
